import { Injectable, NotFoundException } from "@nestjs/common";
import type { ReportStatus } from "@nogal/database";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { NotificationsService } from "@/modules/notifications/notifications.service";
import type { CreateReportInput } from "./dto/create-report.input";
import type { ReportEntity } from "./entities/report.entity";

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  file(reporterId: string, input: CreateReportInput): Promise<ReportEntity> {
    return this.prisma.client.report.create({
      data: {
        reporterId,
        targetType: input.targetType,
        targetId: input.targetId,
        reason: input.reason,
      },
    });
  }

  listPending(): Promise<ReportEntity[]> {
    return this.prisma.client.report.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
    });
  }

  async resolve(
    id: string,
    resolverId: string,
    status: Exclude<ReportStatus, "PENDING">,
  ): Promise<ReportEntity> {
    const report = await this.prisma.client.report.findUnique({
      where: { id },
    });
    if (!report) throw new NotFoundException("Reporte no encontrado.");

    const updated = await this.prisma.client.report.update({
      where: { id },
      data: { status, resolvedById: resolverId, resolvedAt: new Date() },
    });

    await this.notifications.create(report.reporterId, "MODERATION_ACTION", {
      reportId: id,
      status,
    });

    return updated;
  }
}
