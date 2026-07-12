import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { NotificationsService } from "@/modules/notifications/notifications.service";
import {
  FURNITURE_PREVIEW_SELECT,
  type FurniturePreviewRow,
} from "@/modules/furniture/furniture.repository";
import { toFurniturePreviewEntity } from "@/modules/furniture/furniture.mapper";
import type { FurniturePreviewEntity } from "@/modules/furniture/entities/furniture-preview.entity";

const PER_PAGE = 24;

@Injectable()
export class FavoritesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async add(userId: string, furnitureId: string): Promise<boolean> {
    const furniture = await this.prisma.client.furniture.findFirst({
      where: { id: furnitureId, deletedAt: null },
      include: { store: true },
    });
    if (!furniture) throw new NotFoundException("Pieza no encontrada.");

    const existing = await this.prisma.client.favorite.findUnique({
      where: { userId_furnitureId: { userId, furnitureId } },
    });
    if (existing) return true;

    await this.prisma.client.$transaction([
      this.prisma.client.favorite.create({ data: { userId, furnitureId } }),
      this.prisma.client.profile.update({
        where: { userId: furniture.store.ownerId },
        data: { favoritesCount: { increment: 1 } },
      }),
    ]);

    if (furniture.store.ownerId !== userId) {
      await this.notifications.create(
        furniture.store.ownerId,
        "FURNITURE_FAVORITED",
        {
          furnitureId: furniture.id,
          furnitureTitle: furniture.title,
          furnitureSlug: furniture.slug,
          userId,
        },
      );
    }

    return true;
  }

  async remove(userId: string, furnitureId: string): Promise<boolean> {
    const existing = await this.prisma.client.favorite.findUnique({
      where: { userId_furnitureId: { userId, furnitureId } },
      include: { furniture: { include: { store: true } } },
    });
    if (!existing) return true;

    await this.prisma.client.$transaction([
      this.prisma.client.favorite.delete({
        where: { userId_furnitureId: { userId, furnitureId } },
      }),
      this.prisma.client.profile.update({
        where: { userId: existing.furniture.store.ownerId },
        data: { favoritesCount: { decrement: 1 } },
      }),
    ]);
    return true;
  }

  async isFavorited(userId: string, furnitureId: string): Promise<boolean> {
    const found = await this.prisma.client.favorite.findUnique({
      where: { userId_furnitureId: { userId, furnitureId } },
      select: { userId: true },
    });
    return Boolean(found);
  }

  async listForUser(
    userId: string,
    page = 1,
  ): Promise<{
    items: FurniturePreviewEntity[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const safePage = Math.max(1, page);
    const where = { userId, furniture: { deletedAt: null } };

    const [rows, total] = await this.prisma.client.$transaction([
      this.prisma.client.favorite.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (safePage - 1) * PER_PAGE,
        take: PER_PAGE,
        select: { furniture: { select: FURNITURE_PREVIEW_SELECT } },
      }),
      this.prisma.client.favorite.count({ where }),
    ]);

    return {
      items: rows.map((row) =>
        toFurniturePreviewEntity(row.furniture as FurniturePreviewRow),
      ),
      total,
      page: safePage,
      totalPages: Math.max(1, Math.ceil(total / PER_PAGE)),
    };
  }
}
