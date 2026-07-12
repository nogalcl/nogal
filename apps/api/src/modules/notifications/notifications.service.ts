import { Injectable, NotFoundException } from "@nestjs/common";
import type { NotificationType, Prisma } from "@nogal/database";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { formatNotification } from "./notification.format";
import type { NotificationEntity } from "./entities/notification.entity";

const PER_PAGE = 20;

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Punto de entrada único usado por otros módulos (follows, favorites,
   * messaging, reports...) para crear una notificación. El payload es
   * interno — ver notification.format.ts para las claves que cada `type`
   * espera.
   */
  create(
    userId: string,
    type: NotificationType,
    payload: Prisma.InputJsonValue,
  ) {
    return this.prisma.client.notification.create({
      data: { userId, type, payload },
    });
  }

  async findForUser(
    userId: string,
    page = 1,
  ): Promise<{
    items: NotificationEntity[];
    total: number;
    unreadCount: number;
    page: number;
    totalPages: number;
  }> {
    const safePage = Math.max(1, page);
    const [rows, total, unreadCount] = await this.prisma.client.$transaction([
      this.prisma.client.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip: (safePage - 1) * PER_PAGE,
        take: PER_PAGE,
      }),
      this.prisma.client.notification.count({ where: { userId } }),
      this.prisma.client.notification.count({
        where: { userId, readAt: null },
      }),
    ]);

    const items = rows.map((row) => {
      const { message, link } = formatNotification(row.type, row.payload);
      return {
        id: row.id,
        type: row.type,
        message,
        link,
        read: Boolean(row.readAt),
        createdAt: row.createdAt,
      };
    });

    return {
      items,
      total,
      unreadCount,
      page: safePage,
      totalPages: Math.max(1, Math.ceil(total / PER_PAGE)),
    };
  }

  async markRead(id: string, userId: string): Promise<boolean> {
    const notification = await this.prisma.client.notification.findUnique({
      where: { id },
    });
    if (!notification || notification.userId !== userId) {
      throw new NotFoundException("Notificación no encontrada.");
    }
    if (!notification.readAt) {
      await this.prisma.client.notification.update({
        where: { id },
        data: { readAt: new Date() },
      });
    }
    return true;
  }

  async markAllRead(userId: string): Promise<boolean> {
    await this.prisma.client.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return true;
  }
}
