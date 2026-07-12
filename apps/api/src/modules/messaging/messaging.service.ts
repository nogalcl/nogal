import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { NotificationsService } from "@/modules/notifications/notifications.service";
import { BlocksService } from "@/modules/social/blocks.service";
import {
  FURNITURE_PREVIEW_SELECT,
  type FurniturePreviewRow,
} from "@/modules/furniture/furniture.repository";
import { toFurniturePreviewEntity } from "@/modules/furniture/furniture.mapper";
import {
  toParticipant,
  type ConversationEntity,
  type MessageEntity,
} from "./entities/conversation.entity";

const conversationListInclude = {
  furniture: { select: FURNITURE_PREVIEW_SELECT },
  buyer: { include: { profile: true } },
  store: { include: { owner: { include: { profile: true } } } },
  messages: { orderBy: { createdAt: "desc" as const }, take: 1 },
};

const conversationDetailInclude = {
  furniture: { select: FURNITURE_PREVIEW_SELECT },
  buyer: { include: { profile: true } },
  store: { include: { owner: { include: { profile: true } } } },
  messages: { orderBy: { createdAt: "asc" as const } },
};

@Injectable()
export class MessagingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly blocks: BlocksService,
  ) {}

  async startConversation(
    buyerId: string,
    furnitureId: string,
  ): Promise<string> {
    const furniture = await this.prisma.client.furniture.findFirst({
      where: { id: furnitureId, deletedAt: null },
      include: { store: true },
    });
    if (!furniture) throw new NotFoundException("Pieza no encontrada.");

    if (furniture.store.ownerId === buyerId) {
      throw new BadRequestException(
        "No puedes iniciar una conversación sobre tu propia pieza.",
      );
    }

    if (await this.blocks.isBlockedEitherWay(buyerId, furniture.store.ownerId)) {
      throw new ForbiddenException("No es posible contactar a este vendedor.");
    }

    const conversation = await this.prisma.client.conversation.upsert({
      where: { furnitureId_buyerId: { furnitureId, buyerId } },
      update: {},
      create: { furnitureId, buyerId, storeId: furniture.storeId },
    });
    return conversation.id;
  }

  async listForUser(viewerId: string): Promise<ConversationEntity[]> {
    const rows = await this.prisma.client.conversation.findMany({
      where: { OR: [{ buyerId: viewerId }, { store: { ownerId: viewerId } }] },
      include: conversationListInclude,
      orderBy: { updatedAt: "desc" },
    });
    if (rows.length === 0) return [];

    const unreadByConversation = await this.prisma.client.message.groupBy({
      by: ["conversationId"],
      where: {
        conversationId: { in: rows.map((row) => row.id) },
        senderId: { not: viewerId },
        readAt: null,
      },
      _count: true,
    });
    const unreadMap = new Map(
      unreadByConversation.map((row) => [row.conversationId, row._count]),
    );

    return rows.map((row) => {
      const isBuyer = row.buyerId === viewerId;
      const counterpart = isBuyer ? row.store.owner : row.buyer;
      const lastMessage = row.messages[0] ?? null;
      return {
        id: row.id,
        furniture: toFurniturePreviewEntity(
          row.furniture as FurniturePreviewRow,
        ),
        counterpart: toParticipant(counterpart),
        status: row.status,
        lastMessagePreview: lastMessage?.body ?? null,
        unreadCount: unreadMap.get(row.id) ?? 0,
        messages: [],
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };
    });
  }

  async findByIdForUser(
    id: string,
    viewerId: string,
  ): Promise<ConversationEntity> {
    const row = await this.prisma.client.conversation.findUnique({
      where: { id },
      include: conversationDetailInclude,
    });
    if (!row) throw new NotFoundException("Conversación no encontrada.");

    const isBuyer = row.buyerId === viewerId;
    const isSeller = row.store.ownerId === viewerId;
    if (!isBuyer && !isSeller) {
      throw new ForbiddenException("No tienes acceso a esta conversación.");
    }

    const unreadIds = row.messages
      .filter((m) => m.senderId !== viewerId && !m.readAt)
      .map((m) => m.id);
    if (unreadIds.length > 0) {
      await this.prisma.client.message.updateMany({
        where: { id: { in: unreadIds } },
        data: { readAt: new Date() },
      });
    }

    const counterpart = isBuyer ? row.store.owner : row.buyer;

    return {
      id: row.id,
      furniture: toFurniturePreviewEntity(
        row.furniture as FurniturePreviewRow,
      ),
      counterpart: toParticipant(counterpart),
      status: row.status,
      lastMessagePreview: row.messages.at(-1)?.body ?? null,
      unreadCount: 0,
      messages: row.messages.map((m) => this.toMessageEntity(m, viewerId, unreadIds)),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    body: string,
  ): Promise<MessageEntity> {
    const conversation = await this.prisma.client.conversation.findUnique({
      where: { id: conversationId },
      include: {
        store: { include: { owner: { include: { profile: true } } } },
        buyer: { include: { profile: true } },
        furniture: { select: { id: true } },
      },
    });
    if (!conversation) throw new NotFoundException("Conversación no encontrada.");

    const isBuyer = conversation.buyerId === senderId;
    const isSeller = conversation.store.ownerId === senderId;
    if (!isBuyer && !isSeller) {
      throw new ForbiddenException("No tienes acceso a esta conversación.");
    }

    const recipientId = isBuyer
      ? conversation.store.ownerId
      : conversation.buyerId;

    if (await this.blocks.isBlockedEitherWay(senderId, recipientId)) {
      throw new ForbiddenException("No es posible enviar mensajes a este usuario.");
    }

    const trimmed = body.trim();
    if (!trimmed) {
      throw new BadRequestException("El mensaje no puede estar vacío.");
    }

    const [message] = await this.prisma.client.$transaction([
      this.prisma.client.message.create({
        data: {
          conversationId,
          senderId,
          body: trimmed,
          deliveredAt: new Date(),
        },
      }),
      this.prisma.client.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      }),
    ]);

    const senderProfile = isBuyer ? conversation.buyer.profile : conversation.store.owner.profile;
    await this.notifications.create(recipientId, "NEW_MESSAGE", {
      conversationId,
      senderName: senderProfile
        ? `${senderProfile.firstName} ${senderProfile.lastName}`
        : "Alguien",
    });

    return this.toMessageEntity(message, senderId, []);
  }

  private toMessageEntity(
    message: {
      id: string;
      senderId: string;
      body: string;
      attachmentUrls: string[];
      deliveredAt: Date | null;
      readAt: Date | null;
      createdAt: Date;
    },
    viewerId: string,
    justReadIds: string[],
  ): MessageEntity {
    return {
      id: message.id,
      senderId: message.senderId,
      body: message.body,
      attachmentUrls: message.attachmentUrls,
      isMine: message.senderId === viewerId,
      delivered: Boolean(message.deliveredAt),
      read: Boolean(message.readAt) || justReadIds.includes(message.id),
      createdAt: message.createdAt,
    };
  }
}
