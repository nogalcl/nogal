import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "@/modules/prisma/prisma.service";

@Injectable()
export class BlocksService {
  constructor(private readonly prisma: PrismaService) {}

  async block(blockerId: string, blockedId: string): Promise<boolean> {
    if (blockerId === blockedId) {
      throw new BadRequestException("No puedes bloquearte a ti mismo.");
    }
    await this.prisma.client.block.upsert({
      where: { blockerId_blockedId: { blockerId, blockedId } },
      update: {},
      create: { blockerId, blockedId },
    });
    return true;
  }

  async unblock(blockerId: string, blockedId: string): Promise<boolean> {
    await this.prisma.client.block.deleteMany({
      where: { blockerId, blockedId },
    });
    return true;
  }

  /** true si cualquiera de los dos bloqueó al otro — se usa para impedir mensajería. */
  async isBlockedEitherWay(userA: string, userB: string): Promise<boolean> {
    const found = await this.prisma.client.block.findFirst({
      where: {
        OR: [
          { blockerId: userA, blockedId: userB },
          { blockerId: userB, blockedId: userA },
        ],
      },
      select: { blockerId: true },
    });
    return Boolean(found);
  }

  listBlockedByUser(userId: string) {
    return this.prisma.client.block.findMany({
      where: { blockerId: userId },
      include: { blocked: { include: { profile: true } } },
      orderBy: { createdAt: "desc" },
    });
  }
}
