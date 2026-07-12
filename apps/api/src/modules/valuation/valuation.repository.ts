import { Injectable } from "@nestjs/common";
import type { Prisma, ValuationRequestStatus } from "@nogal/database";
import { PrismaService } from "@/modules/prisma/prisma.service";

export const VALUATION_REQUEST_INCLUDE = {
  category: true,
  images: { orderBy: { order: "asc" as const } },
  requester: { include: { profile: true } },
  assignedExpert: { include: { profile: true } },
  comments: {
    include: { author: { include: { profile: true } } },
    orderBy: { createdAt: "asc" as const },
  },
  report: {
    include: {
      expert: { include: { profile: true } },
      materials: true,
      woodTypes: true,
      style: true,
      designer: { include: { country: true } },
      manufacturer: { include: { country: true } },
    },
  },
} satisfies Prisma.ValuationRequestInclude;

export type ValuationRequestWithRelations = Prisma.ValuationRequestGetPayload<{
  include: typeof VALUATION_REQUEST_INCLUDE;
}>;

@Injectable()
export class ValuationRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<ValuationRequestWithRelations | null> {
    return this.prisma.client.valuationRequest.findUnique({
      where: { id },
      include: VALUATION_REQUEST_INCLUDE,
    });
  }

  findManyByRequester(requesterId: string): Promise<ValuationRequestWithRelations[]> {
    return this.prisma.client.valuationRequest.findMany({
      where: { requesterId },
      include: VALUATION_REQUEST_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
  }

  findManyForStaff(filter: {
    status?: ValuationRequestStatus;
    assignedExpertId?: string;
  }): Promise<ValuationRequestWithRelations[]> {
    return this.prisma.client.valuationRequest.findMany({
      where: {
        status: filter.status,
        assignedExpertId: filter.assignedExpertId,
        // El panel experto nunca necesita ver borradores sin enviar.
        NOT: filter.status ? undefined : { status: "DRAFT" },
      },
      include: VALUATION_REQUEST_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
  }

  create(requesterId: string): Promise<ValuationRequestWithRelations> {
    return this.prisma.client.valuationRequest.create({
      data: { requesterId },
      include: VALUATION_REQUEST_INCLUDE,
    });
  }

  update(
    id: string,
    data: Prisma.ValuationRequestUpdateInput,
  ): Promise<ValuationRequestWithRelations> {
    return this.prisma.client.valuationRequest.update({
      where: { id },
      data,
      include: VALUATION_REQUEST_INCLUDE,
    });
  }

  countImages(requestId: string): Promise<number> {
    return this.prisma.client.valuationRequestImage.count({
      where: { valuationRequestId: requestId },
    });
  }

  nextImageOrder(requestId: string): Promise<number> {
    return this.prisma.client.valuationRequestImage
      .aggregate({
        where: { valuationRequestId: requestId },
        _max: { order: true },
      })
      .then((result) => (result._max.order ?? -1) + 1);
  }

  createImage(data: Prisma.ValuationRequestImageCreateInput) {
    return this.prisma.client.valuationRequestImage.create({ data });
  }

  findImageById(id: string) {
    return this.prisma.client.valuationRequestImage.findUnique({
      where: { id },
      include: {
        valuationRequest: { select: { id: true, requesterId: true } },
      },
    });
  }

  deleteImage(id: string) {
    return this.prisma.client.valuationRequestImage.delete({ where: { id } });
  }

  addComment(requestId: string, authorId: string, body: string) {
    return this.prisma.client.valuationComment.create({
      data: { valuationRequestId: requestId, authorId, body },
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
        targetType: "ValuationRequest",
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
      where: { targetType: "ValuationRequest", targetId: requestId },
      include: { actor: { include: { profile: true } } },
      orderBy: { createdAt: "asc" },
    });
  }
}
