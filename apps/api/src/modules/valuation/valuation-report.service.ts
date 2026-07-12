import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { NotificationsService } from "@/modules/notifications/notifications.service";
import { toValuationReportEntity } from "./valuation.mapper";
import type { ValuationReportInput } from "./dto/valuation-report.input";
import type { ValuationReportEntity } from "./entities/valuation-report.entity";
import type { Viewer } from "./valuation.service";

const reportInclude = {
  expert: { include: { profile: true } },
  materials: true,
  woodTypes: true,
  style: true,
  designer: { include: { country: true } },
  manufacturer: { include: { country: true } },
} as const;

function connectMany(ids?: string[]) {
  return ids?.length ? { connect: ids.map((id) => ({ id })) } : undefined;
}

function connectOptional(id?: string) {
  return id ? { connect: { id } } : undefined;
}

@Injectable()
export class ValuationReportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async findByRequestId(
    requestId: string,
    viewer: Viewer,
  ): Promise<ValuationReportEntity | null> {
    const request = await this.prisma.client.valuationRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) throw new NotFoundException("Solicitud no encontrada.");
    const isStaff = viewer.role === "MODERATOR" || viewer.role === "ADMIN";
    if (request.requesterId !== viewer.sub && !isStaff) {
      throw new NotFoundException("Informe no encontrado.");
    }

    const report = await this.prisma.client.valuationReport.findUnique({
      where: { requestId },
      include: reportInclude,
    });
    return report ? toValuationReportEntity(report) : null;
  }

  async create(
    input: ValuationReportInput,
    viewer: Viewer,
  ): Promise<ValuationReportEntity> {
    const request = await this.prisma.client.valuationRequest.findUnique({
      where: { id: input.requestId },
    });
    if (!request) throw new NotFoundException("Solicitud no encontrada.");
    if (request.status !== "IN_REVIEW") {
      throw new BadRequestException(
        "La solicitud debe estar en revisión para generar el informe.",
      );
    }
    if (Number(input.estimatedValueMin) > Number(input.estimatedValueMax)) {
      throw new BadRequestException(
        "El valor mínimo no puede ser mayor que el máximo.",
      );
    }

    const [report] = await this.prisma.client.$transaction([
      this.prisma.client.valuationReport.create({
        data: {
          request: { connect: { id: input.requestId } },
          expert: { connect: { id: viewer.sub } },
          summary: input.summary,
          probableIdentification: input.probableIdentification,
          materials: connectMany(input.materialIds),
          woodTypes: connectMany(input.woodTypeIds),
          style: connectOptional(input.styleId),
          decade: input.decade,
          designer: connectOptional(input.designerId),
          manufacturer: connectOptional(input.manufacturerId),
          condition: input.condition,
          observations: input.observations,
          warnings: input.warnings,
          estimatedValueMin: input.estimatedValueMin,
          estimatedValueMax: input.estimatedValueMax,
          quickSaleValue: input.quickSaleValue,
          idealSaleValue: input.idealSaleValue,
          estimatedSaleTime: input.estimatedSaleTime,
          tips: input.tips,
          confidenceLevel: input.confidenceLevel,
        },
        include: reportInclude,
      }),
      this.prisma.client.valuationRequest.update({
        where: { id: input.requestId },
        data: { status: "COMPLETED" },
      }),
      this.prisma.client.auditLog.create({
        data: {
          actorId: viewer.sub,
          action: "valuation.report_created",
          targetType: "ValuationRequest",
          targetId: input.requestId,
        },
      }),
    ]);

    await this.notifications.create(request.requesterId, "VALUATION_READY", {
      requestId: request.id,
      requestTitle: request.title,
    });

    return toValuationReportEntity(report);
  }

  async update(
    input: ValuationReportInput,
    viewer: Viewer,
  ): Promise<ValuationReportEntity> {
    const existing = await this.prisma.client.valuationReport.findUnique({
      where: { requestId: input.requestId },
    });
    if (!existing) throw new NotFoundException("Informe no encontrado.");

    const updated = await this.prisma.client.valuationReport.update({
      where: { requestId: input.requestId },
      data: {
        summary: input.summary,
        probableIdentification: input.probableIdentification,
        materials: input.materialIds
          ? { set: input.materialIds.map((id) => ({ id })) }
          : undefined,
        woodTypes: input.woodTypeIds
          ? { set: input.woodTypeIds.map((id) => ({ id })) }
          : undefined,
        style:
          input.styleId !== undefined
            ? input.styleId
              ? { connect: { id: input.styleId } }
              : { disconnect: true }
            : undefined,
        decade: input.decade,
        designer:
          input.designerId !== undefined
            ? input.designerId
              ? { connect: { id: input.designerId } }
              : { disconnect: true }
            : undefined,
        manufacturer:
          input.manufacturerId !== undefined
            ? input.manufacturerId
              ? { connect: { id: input.manufacturerId } }
              : { disconnect: true }
            : undefined,
        condition: input.condition,
        observations: input.observations,
        warnings: input.warnings,
        estimatedValueMin: input.estimatedValueMin,
        estimatedValueMax: input.estimatedValueMax,
        quickSaleValue: input.quickSaleValue,
        idealSaleValue: input.idealSaleValue,
        estimatedSaleTime: input.estimatedSaleTime,
        tips: input.tips,
        confidenceLevel: input.confidenceLevel,
      },
      include: reportInclude,
    });

    await this.prisma.client.auditLog.create({
      data: {
        actorId: viewer.sub,
        action: "valuation.report_updated",
        targetType: "ValuationRequest",
        targetId: input.requestId,
      },
    });

    return toValuationReportEntity(updated);
  }
}
