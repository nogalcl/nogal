import type { Prisma } from "@nogal/database";
import { toParticipant } from "@/modules/messaging/entities/conversation.entity";
import { formatValuationHistory } from "./valuation-history.format";
import type { ValuationRequestWithRelations } from "./valuation.repository";
import type {
  ValuationCommentEntity,
  ValuationHistoryEntryEntity,
  ValuationRequestEntity,
} from "./entities/valuation-request.entity";
import type { ValuationReportEntity } from "./entities/valuation-report.entity";

type ReportRow = NonNullable<ValuationRequestWithRelations["report"]>;

export function toValuationReportEntity(report: ReportRow): ValuationReportEntity {
  return {
    id: report.id,
    requestId: report.requestId,
    expert: toParticipant(report.expert),
    summary: report.summary,
    probableIdentification: report.probableIdentification,
    materials: report.materials,
    woodTypes: report.woodTypes,
    style: report.style,
    decade: report.decade,
    designer: report.designer,
    manufacturer: report.manufacturer,
    condition: report.condition,
    observations: report.observations,
    warnings: report.warnings,
    estimatedValueMin: Number(report.estimatedValueMin),
    estimatedValueMax: Number(report.estimatedValueMax),
    quickSaleValue: report.quickSaleValue ? Number(report.quickSaleValue) : null,
    idealSaleValue: report.idealSaleValue ? Number(report.idealSaleValue) : null,
    currency: report.currency,
    estimatedSaleTime: report.estimatedSaleTime,
    tips: report.tips,
    confidenceLevel: report.confidenceLevel,
    pdfUrl: report.pdfUrl,
    providedAt: report.providedAt,
    updatedAt: report.updatedAt,
  };
}

type HistoryRow = Prisma.AuditLogGetPayload<{
  include: { actor: { include: { profile: true } } };
}>;

function toHistoryEntity(row: HistoryRow): ValuationHistoryEntryEntity {
  return {
    id: row.id,
    description: formatValuationHistory(row.action, row.metadata),
    actorName: row.actor?.profile
      ? `${row.actor.profile.firstName} ${row.actor.profile.lastName}`
      : null,
    createdAt: row.createdAt,
  };
}

export function toValuationRequestEntity(
  row: ValuationRequestWithRelations,
  options: { forStaff: boolean; history?: HistoryRow[] },
): ValuationRequestEntity {
  const comments: ValuationCommentEntity[] = options.forStaff
    ? row.comments.map((comment) => ({
        id: comment.id,
        body: comment.body,
        author: toParticipant(comment.author),
        createdAt: comment.createdAt,
      }))
    : [];

  const history: ValuationHistoryEntryEntity[] = options.forStaff
    ? (options.history ?? []).map(toHistoryEntity)
    : [];

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    estimatedDecade: row.estimatedDecade,
    locationCity: row.locationCity,
    objective: row.objective,
    images: row.images,
    serviceFee: Number(row.serviceFee),
    currency: row.currency,
    paidAt: row.paidAt,
    status: row.status,
    requester: toParticipant(row.requester),
    assignedExpert: row.assignedExpert ? toParticipant(row.assignedExpert) : null,
    comments,
    history,
    report: row.report ? toValuationReportEntity(row.report) : null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
