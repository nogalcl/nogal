import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { User, Profile, Country, RoleName } from "@nogal/database";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { FollowsService } from "@/modules/social/follows.service";
import {
  FURNITURE_PREVIEW_SELECT,
  type FurniturePreviewRow,
} from "@/modules/furniture/furniture.repository";
import { toFurniturePreviewEntity } from "@/modules/furniture/furniture.mapper";
import {
  STORAGE_PROVIDER,
  type StorageProvider,
} from "@/modules/storage/storage.interface";
import type { UserEntity } from "./entities/user.entity";
import type { PublicProfileEntity } from "./entities/public-profile.entity";

type UserWithRelations = User & {
  role: { name: string };
  profile: (Profile & { country: Country | null }) | null;
};

const PUBLIC_PIECE_STATES = ["PUBLISHED", "RESERVED"] as const;
const SOLD_STATES = ["SOLD"] as const;
const COUNTED_LISTING_STATES = ["PUBLISHED", "RESERVED", "SOLD"] as const;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly followsService: FollowsService,
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
  ) {}

  private readonly includeRelations = {
    role: true,
    profile: { include: { country: true } },
  } as const;

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.client.user.findUnique({
      where: { id, deletedAt: null },
      include: this.includeRelations,
    });
    return user ? this.toEntity(user) : null;
  }

  async findByEmail(email: string) {
    return this.prisma.client.user.findUnique({
      where: { email, deletedAt: null },
      include: this.includeRelations,
    });
  }

  async findByUsername(username: string) {
    return this.prisma.client.profile.findUnique({ where: { username } });
  }

  roles() {
    return this.prisma.client.role.findMany({ orderBy: { name: "asc" } });
  }

  async findPublicProfile(
    username: string,
    viewerId: string | null,
  ): Promise<PublicProfileEntity | null> {
    const user = await this.prisma.client.user.findFirst({
      where: { deletedAt: null, profile: { username } },
      include: { profile: { include: { country: true } }, store: true },
    });
    if (!user?.profile) return null;

    const [listingsCount, salesCount, isFollowedByViewer] = await Promise.all([
      this.prisma.client.furniture.count({
        where: {
          store: { ownerId: user.id },
          deletedAt: null,
          status: { in: [...COUNTED_LISTING_STATES] },
        },
      }),
      this.prisma.client.furniture.count({
        where: {
          store: { ownerId: user.id },
          deletedAt: null,
          status: { in: [...SOLD_STATES] },
        },
      }),
      viewerId
        ? this.followsService.isFollowing(viewerId, user.id)
        : Promise.resolve(false),
    ]);

    const pieceRows = user.store
      ? await this.prisma.client.furniture.findMany({
          where: {
            storeId: user.store.id,
            deletedAt: null,
            status: { in: [...PUBLIC_PIECE_STATES] },
          },
          orderBy: { createdAt: "desc" },
          take: 24,
          select: FURNITURE_PREVIEW_SELECT,
        })
      : [];

    return {
      userId: user.id,
      username: user.profile.username,
      firstName: user.profile.firstName,
      lastName: user.profile.lastName,
      avatarUrl: user.profile.avatarUrl,
      bio: user.profile.bio,
      city: user.profile.city,
      country: user.profile.country,
      memberSince: user.createdAt,
      reputation: user.profile.reputation,
      followersCount: user.profile.followersCount,
      followingCount: user.profile.followingCount,
      listingsCount,
      salesCount,
      isFollowedByViewer,
      isOwnProfile: viewerId === user.id,
      store: user.store
        ? {
            id: user.store.id,
            name: user.store.name,
            slug: user.store.slug,
            isVerified: user.store.isVerified,
          }
        : null,
      pieces: pieceRows.map((row) =>
        toFurniturePreviewEntity(row as FurniturePreviewRow),
      ),
    };
  }

  async updateAvatar(userId: string, buffer: Buffer): Promise<UserEntity> {
    const previous = await this.prisma.client.profile.findUniqueOrThrow({
      where: { userId },
      select: { avatarUrl: true },
    });
    const stored = await this.storage.storeImage({
      buffer,
      keyPrefix: `profile/${userId}`,
    });
    await this.prisma.client.profile.update({
      where: { userId },
      data: { avatarUrl: stored.publicUrl },
    });
    if (previous.avatarUrl) {
      await this.storage.deleteObject(keyFromPublicUrl(previous.avatarUrl));
    }
    const user = await this.prisma.client.user.findUniqueOrThrow({
      where: { id: userId },
      include: this.includeRelations,
    });
    return this.toEntity(user);
  }

  async removeAvatar(userId: string): Promise<UserEntity> {
    const previous = await this.prisma.client.profile.findUniqueOrThrow({
      where: { userId },
      select: { avatarUrl: true },
    });
    await this.prisma.client.profile.update({
      where: { userId },
      data: { avatarUrl: null },
    });
    if (previous.avatarUrl) {
      await this.storage.deleteObject(keyFromPublicUrl(previous.avatarUrl));
    }
    const user = await this.prisma.client.user.findUniqueOrThrow({
      where: { id: userId },
      include: this.includeRelations,
    });
    return this.toEntity(user);
  }

  // -----------------------------------------------------------------------
  // Panel admin (ADMIN — guard de rol aplicado en el resolver)
  // -----------------------------------------------------------------------

  async findManyForAdmin(search?: string): Promise<UserEntity[]> {
    const rows = await this.prisma.client.user.findMany({
      where: search
        ? {
            OR: [
              { email: { contains: search, mode: "insensitive" } },
              { profile: { username: { contains: search, mode: "insensitive" } } },
              { profile: { firstName: { contains: search, mode: "insensitive" } } },
              { profile: { lastName: { contains: search, mode: "insensitive" } } },
            ],
          }
        : undefined,
      include: this.includeRelations,
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return rows.map((row) => this.toEntity(row));
  }

  async setRole(userId: string, roleName: RoleName): Promise<UserEntity> {
    const role = await this.prisma.client.role.findUnique({
      where: { name: roleName },
    });
    if (!role) throw new NotFoundException("Rol no encontrado.");

    const updated = await this.prisma.client.user.update({
      where: { id: userId },
      data: { roleId: role.id },
      include: this.includeRelations,
    });
    return this.toEntity(updated);
  }

  async setSuspended(userId: string, suspended: boolean): Promise<UserEntity> {
    const updated = await this.prisma.client.user.update({
      where: { id: userId },
      data: { deletedAt: suspended ? new Date() : null },
      include: this.includeRelations,
    });
    return this.toEntity(updated);
  }

  toEntity(user: UserWithRelations): UserEntity {
    return {
      id: user.id,
      email: user.email,
      emailVerified: Boolean(user.emailVerifiedAt),
      role: user.role.name as UserEntity["role"],
      createdAt: user.createdAt,
      deletedAt: user.deletedAt,
      profile: user.profile
        ? {
            id: user.profile.id,
            firstName: user.profile.firstName,
            lastName: user.profile.lastName,
            username: user.profile.username,
            avatarUrl: user.profile.avatarUrl,
            bio: user.profile.bio,
            phone: user.profile.phone,
            country: user.profile.country,
            region: user.profile.region,
            city: user.profile.city,
            reputation: user.profile.reputation,
            favoritesCount: user.profile.favoritesCount,
            followersCount: user.profile.followersCount,
            followingCount: user.profile.followingCount,
            createdAt: user.profile.createdAt,
          }
        : null,
    };
  }
}

function keyFromPublicUrl(url: string): string {
  const path = new URL(url).pathname.replace(/^\//, "");
  return path.startsWith("uploads/") ? path.slice("uploads/".length) : path;
}
