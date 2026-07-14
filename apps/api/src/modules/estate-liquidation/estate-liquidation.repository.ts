import { Injectable } from "@nestjs/common";
import type { EstateLiquidationRequestStatus, Prisma } from "@nogal/database";
import { PrismaService } from "@/modules/prisma/prisma.service";

const PIECE_INCLUDE = {
  category: true,
  images: { orderBy: { order: "asc" as const } },
  recommendedRestorer: true,
  classifiedBy: { include: { profile: true } },
} satisfies Prisma.EstateLiquidationPieceInclude;

export const ESTATE_LIQUIDATION_REQUEST_INCLUDE = {
  pieces: {
    include: PIECE_INCLUDE,
    orderBy: { order: "asc" as const },
  },
  requester: { include: { profile: true } },
  assignedExpert: { include: { profile: true } },
  comments: {
    include: { author: { include: { profile: true } } },
    orderBy: { createdAt: "asc" as const },
  },
} satisfies Prisma.EstateLiquidationRequestInclude;

export type EstateLiquidationRequestWithRelations =
  Prisma.EstateLiquidationRequestGetPayload<{
    include: typeof ESTATE_LIQUIDATION_REQUEST_INCLUDE;
  }>;

export type EstateLiquidationPieceWithRelations =
  Prisma.EstateLiquidationPieceGetPayload<{ include: typeof PIECE_INCLUDE }>;

@Injectable()
export class EstateLiquidationRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<EstateLiquidationRequestWithRelations | null> {
    return this.prisma.client.estateLiquidationRequest.findUnique({
      where: { id },
      include: ESTATE_LIQUIDATION_REQUEST_INCLUDE,
    });
  }

  findManyByRequester(
    requesterId: string,
  ): Promise<EstateLiquidationRequestWithRelations[]> {
    return this.prisma.client.estateLiquidationRequest.findMany({
      where: { requesterId },
      include: ESTATE_LIQUIDATION_REQUEST_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
  }

  findManyForStaff(filter: {
    status?: EstateLiquidationRequestStatus;
    assignedExpertId?: string;
  }): Promise<EstateLiquidationRequestWithRelations[]> {
    return this.prisma.client.estateLiquidationRequest.findMany({
      where: {
        status: filter.status,
        assignedExpertId: filter.assignedExpertId,
        // El panel experto nunca necesita ver borradores sin enviar.
        NOT: filter.status ? undefined : { status: "DRAFT" },
      },
      include: ESTATE_LIQUIDATION_REQUEST_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
  }

  create(requesterId: string): Promise<EstateLiquidationRequestWithRelations> {
    return this.prisma.client.estateLiquidationRequest.create({
      data: { requesterId },
      include: ESTATE_LIQUIDATION_REQUEST_INCLUDE,
    });
  }

  update(
    id: string,
    data: Prisma.EstateLiquidationRequestUpdateInput,
  ): Promise<EstateLiquidationRequestWithRelations> {
    return this.prisma.client.estateLiquidationRequest.update({
      where: { id },
      data,
      include: ESTATE_LIQUIDATION_REQUEST_INCLUDE,
    });
  }

  // --- Piezas ---

  findPieceById(id: string) {
    return this.prisma.client.estateLiquidationPiece.findUnique({
      where: { id },
      include: {
        ...PIECE_INCLUDE,
        request: { select: { id: true, requesterId: true, status: true } },
      },
    });
  }

  createPiece(data: {
    requestId: string;
    title: string;
    description?: string;
    categoryId?: string;
    order: number;
  }): Promise<EstateLiquidationPieceWithRelations> {
    const { requestId, categoryId, ...rest } = data;
    return this.prisma.client.estateLiquidationPiece.create({
      data: {
        ...rest,
        request: { connect: { id: requestId } },
        category: categoryId ? { connect: { id: categoryId } } : undefined,
      },
      include: PIECE_INCLUDE,
    });
  }

  updatePiece(
    id: string,
    data: Prisma.EstateLiquidationPieceUpdateInput,
  ): Promise<EstateLiquidationPieceWithRelations> {
    return this.prisma.client.estateLiquidationPiece.update({
      where: { id },
      data,
      include: PIECE_INCLUDE,
    });
  }

  deletePiece(id: string) {
    return this.prisma.client.estateLiquidationPiece.delete({ where: { id } });
  }

  countPieces(requestId: string): Promise<number> {
    return this.prisma.client.estateLiquidationPiece.count({
      where: { requestId },
    });
  }

  nextPieceOrder(requestId: string): Promise<number> {
    return this.prisma.client.estateLiquidationPiece
      .aggregate({ where: { requestId }, _max: { order: true } })
      .then((result) => (result._max.order ?? -1) + 1);
  }

  // --- Imágenes por pieza ---

  countImages(pieceId: string): Promise<number> {
    return this.prisma.client.estateLiquidationPieceImage.count({
      where: { pieceId },
    });
  }

  nextImageOrder(pieceId: string): Promise<number> {
    return this.prisma.client.estateLiquidationPieceImage
      .aggregate({ where: { pieceId }, _max: { order: true } })
      .then((result) => (result._max.order ?? -1) + 1);
  }

  createImage(data: Prisma.EstateLiquidationPieceImageCreateInput) {
    return this.prisma.client.estateLiquidationPieceImage.create({ data });
  }

  findImageById(id: string) {
    return this.prisma.client.estateLiquidationPieceImage.findUnique({
      where: { id },
      include: {
        piece: { select: { id: true, requestId: true } },
      },
    });
  }

  deleteImage(id: string) {
    return this.prisma.client.estateLiquidationPieceImage.delete({
      where: { id },
    });
  }

  // --- Staff ---

  addComment(requestId: string, authorId: string, body: string) {
    return this.prisma.client.estateLiquidationComment.create({
      data: { requestId, authorId, body },
      include: { author: { include: { profile: true } } },
    });
  }

  logHistory(
    actorId: string,
    requestId: string,
    action: string,
    metadata?: Prisma.InputJsonValue,
  ) {
    return this.prisma.client.auditLog.create({
      data: {
        actorId,
        action,
        targetType: "EstateLiquidationRequest",
        targetId: requestId,
        metadata,
      },
    });
  }

  async findStaffUserIds(): Promise<string[]> {
    const rows = await this.findStaffUsers();
    return rows.map((row) => row.id);
  }

  findStaffUsers() {
    return this.prisma.client.user.findMany({
      where: {
        deletedAt: null,
        role: { name: { in: ["MODERATOR", "ADMIN"] } },
      },
      include: { profile: true },
    });
  }

  findHistory(requestId: string) {
    return this.prisma.client.auditLog.findMany({
      where: { targetType: "EstateLiquidationRequest", targetId: requestId },
      include: { actor: { include: { profile: true } } },
      orderBy: { createdAt: "asc" },
    });
  }
}
