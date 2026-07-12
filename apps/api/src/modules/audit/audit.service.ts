import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/modules/prisma/prisma.service";
import type { AuditLogEntity } from "./entities/audit-log.entity";

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async findRecent(targetType?: string): Promise<AuditLogEntity[]> {
    const rows = await this.prisma.client.auditLog.findMany({
      where: targetType ? { targetType } : undefined,
      include: { actor: { include: { profile: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return rows.map((row) => ({
      id: row.id,
      actorName: row.actor?.profile
        ? `${row.actor.profile.firstName} ${row.actor.profile.lastName}`
        : (row.actor?.email ?? null),
      action: row.action,
      targetType: row.targetType,
      targetId: row.targetId,
      createdAt: row.createdAt,
    }));
  }
}
