import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { NotificationsService } from "@/modules/notifications/notifications.service";
import { BlocksService } from "./blocks.service";

@Injectable()
export class FollowsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly blocks: BlocksService,
  ) {}

  async follow(followerId: string, followingId: string): Promise<boolean> {
    if (followerId === followingId) {
      throw new BadRequestException("No puedes seguirte a ti mismo.");
    }

    const target = await this.prisma.client.user.findUnique({
      where: { id: followingId, deletedAt: null },
      include: { profile: true },
    });
    if (!target) throw new NotFoundException("Cuenta no encontrada.");

    if (await this.blocks.isBlockedEitherWay(followerId, followingId)) {
      throw new BadRequestException("No es posible seguir a esta cuenta.");
    }

    const alreadyFollowing = await this.prisma.client.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    if (alreadyFollowing) return true;

    const follower = await this.prisma.client.user.findUnique({
      where: { id: followerId },
      include: { profile: true },
    });

    await this.prisma.client.$transaction([
      this.prisma.client.follow.create({ data: { followerId, followingId } }),
      this.prisma.client.profile.update({
        where: { userId: followingId },
        data: { followersCount: { increment: 1 } },
      }),
      this.prisma.client.profile.update({
        where: { userId: followerId },
        data: { followingCount: { increment: 1 } },
      }),
    ]);

    if (target.profile) {
      await this.notifications.create(followingId, "NEW_FOLLOWER", {
        followerId,
        followerUsername: follower?.profile?.username ?? null,
        followerName: follower?.profile
          ? `${follower.profile.firstName} ${follower.profile.lastName}`
          : "Alguien",
      });
    }

    return true;
  }

  async unfollow(followerId: string, followingId: string): Promise<boolean> {
    const existing = await this.prisma.client.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    if (!existing) return true;

    await this.prisma.client.$transaction([
      this.prisma.client.follow.delete({
        where: { followerId_followingId: { followerId, followingId } },
      }),
      this.prisma.client.profile.update({
        where: { userId: followingId },
        data: { followersCount: { decrement: 1 } },
      }),
      this.prisma.client.profile.update({
        where: { userId: followerId },
        data: { followingCount: { decrement: 1 } },
      }),
    ]);
    return true;
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const found = await this.prisma.client.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
      select: { followerId: true },
    });
    return Boolean(found);
  }
}
