import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { Prisma, Store } from "@nogal/database";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { generateUniqueSlug } from "@/common/utils/slug";
import {
  jsonToKeyValueList,
  keyValueListToJson,
} from "@/common/graphql/key-value.entity";
import type { UpdateStoreInput } from "./dto/update-store.input";
import type { StoreEntity } from "./entities/store.entity";

const storeInclude = {
  owner: { include: { profile: true } },
  locationCountry: true,
} satisfies Prisma.StoreInclude;

type StoreWithRelations = Prisma.StoreGetPayload<{ include: typeof storeInclude }>;

@Injectable()
export class StoresService {
  constructor(private readonly prisma: PrismaService) {}

  private async toEntity(store: StoreWithRelations): Promise<StoreEntity> {
    const pieceCount = await this.prisma.client.furniture.count({
      where: {
        storeId: store.id,
        deletedAt: null,
        status: { in: ["PUBLISHED", "RESERVED", "SOLD"] },
      },
    });

    return {
      id: store.id,
      name: store.name,
      slug: store.slug,
      bio: store.bio,
      isVerified: store.isVerified,
      logoUrl: store.logoUrl,
      bannerUrl: store.bannerUrl,
      websiteUrl: store.websiteUrl,
      socialLinks: jsonToKeyValueList(store.socialLinks),
      schedule: jsonToKeyValueList(store.schedule),
      locationCity: store.locationCity,
      locationRegion: store.locationRegion,
      locationCountry: store.locationCountry,
      ownerId: store.ownerId,
      ownerUsername: store.owner.profile?.username ?? null,
      pieceCount,
      followersCount: store.owner.profile?.followersCount ?? 0,
      createdAt: store.createdAt,
    };
  }

  async findByOwnerId(ownerId: string): Promise<StoreEntity | null> {
    const store = await this.prisma.client.store.findUnique({
      where: { ownerId, deletedAt: null },
      include: storeInclude,
    });
    return store ? this.toEntity(store) : null;
  }

  /** Fila cruda de Prisma (sin mapear) — usada internamente por otros módulos que solo necesitan id/ownerId. */
  findById(id: string): Promise<Store | null> {
    return this.prisma.client.store.findUnique({
      where: { id, deletedAt: null },
    });
  }

  async findEntityBySlug(slug: string): Promise<StoreEntity | null> {
    const store = await this.prisma.client.store.findUnique({
      where: { slug, deletedAt: null },
      include: storeInclude,
    });
    return store ? this.toEntity(store) : null;
  }

  /** Panel admin — incluye tiendas sin verificar; búsqueda simple por nombre. */
  async findManyForAdmin(search?: string): Promise<StoreEntity[]> {
    const rows = await this.prisma.client.store.findMany({
      where: {
        deletedAt: null,
        name: search ? { contains: search, mode: "insensitive" } : undefined,
      },
      include: storeInclude,
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return Promise.all(rows.map((row) => this.toEntity(row)));
  }

  /**
   * Verificación manual por un administrador. No sustituye el KYC real
   * (Stripe Identity/Connect) previsto en BUSINESS_RULES.md — es la única
   * señal de confianza disponible mientras ese flujo no exista, para no
   * dejar el sistema sin ningún mecanismo de verificación.
   */
  async setVerified(storeId: string, isVerified: boolean): Promise<StoreEntity> {
    const store = await this.findById(storeId);
    if (!store) throw new NotFoundException("Atelier no encontrado.");

    const updated = await this.prisma.client.store.update({
      where: { id: storeId },
      data: { isVerified },
      include: storeInclude,
    });
    return this.toEntity(updated);
  }

  async create(ownerId: string, name: string): Promise<StoreEntity> {
    const existing = await this.findByOwnerId(ownerId);
    if (existing) {
      throw new ConflictException("Ya tienes un atelier creado.");
    }

    const slug = await generateUniqueSlug(name, async (candidate) => {
      const found = await this.prisma.client.store.findUnique({
        where: { slug: candidate },
      });
      return Boolean(found);
    });

    const created = await this.prisma.client.store.create({
      data: { ownerId, name, slug },
      include: storeInclude,
    });
    return this.toEntity(created);
  }

  async update(
    ownerId: string,
    input: UpdateStoreInput,
  ): Promise<StoreEntity> {
    const store = await this.prisma.client.store.findUnique({
      where: { ownerId, deletedAt: null },
    });
    if (!store) throw new NotFoundException("No tienes un atelier creado.");

    const updated = await this.prisma.client.store.update({
      where: { id: store.id },
      data: {
        bio: input.bio,
        logoUrl: input.logoUrl,
        bannerUrl: input.bannerUrl,
        websiteUrl: input.websiteUrl,
        socialLinks: keyValueListToJson(input.socialLinks),
        schedule: keyValueListToJson(input.schedule),
        locationCity: input.locationCity,
        locationRegion: input.locationRegion,
        locationCountry: input.locationCountryId
          ? { connect: { id: input.locationCountryId } }
          : undefined,
      },
      include: storeInclude,
    });
    return this.toEntity(updated);
  }
}
