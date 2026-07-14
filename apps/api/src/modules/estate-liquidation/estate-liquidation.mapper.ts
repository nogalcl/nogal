import type { Prisma } from "@nogal/database";
import { toParticipant } from "@/modules/messaging/entities/conversation.entity";
import { formatEstateLiquidationHistory } from "./estate-liquidation-history.format";
import type {
  EstateLiquidationPieceWithRelations,
  EstateLiquidationRequestWithRelations,
} from "./estate-liquidation.repository";
import type {
  EstateLiquidationCommentEntity,
  EstateLiquidationHistoryEntryEntity,
  EstateLiquidationRequestEntity,
} from "./entities/estate-liquidation-request.entity";
import type { EstateLiquidationPieceEntity } from "./entities/estate-liquidation-piece.entity";

/** El cliente ve el resultado de su pieza (p. ej. "derivada a
 * restauración"), pero nunca el contacto del restaurador — Nogal actúa de
 * intermediario (decisión de negocio confirmada, ver plan). */
export function toEstateLiquidationPieceEntity(
  piece: EstateLiquidationPieceWithRelations,
  options: { forStaff: boolean },
): EstateLiquidationPieceEntity {
  return {
    id: piece.id,
    requestId: piece.requestId,
    title: piece.title,
    description: piece.description,
    category: piece.category,
    images: piece.images,
    outcome: piece.outcome,
    condition: piece.condition,
    expertNotes: piece.expertNotes,
    estimatedValueMin: piece.estimatedValueMin
      ? Number(piece.estimatedValueMin)
      : null,
    estimatedValueMax: piece.estimatedValueMax
      ? Number(piece.estimatedValueMax)
      : null,
    recommendedRestorer: options.forStaff ? piece.recommendedRestorer : null,
    classifiedAt: piece.classifiedAt,
    classifiedBy: piece.classifiedBy ? toParticipant(piece.classifiedBy) : null,
    order: piece.order,
    createdAt: piece.createdAt,
    updatedAt: piece.updatedAt,
  };
}

type HistoryRow = Prisma.AuditLogGetPayload<{
  include: { actor: { include: { profile: true } } };
}>;

function toHistoryEntity(row: HistoryRow): EstateLiquidationHistoryEntryEntity {
  return {
    id: row.id,
    description: formatEstateLiquidationHistory(row.action, row.metadata),
    actorName: row.actor?.profile
      ? `${row.actor.profile.firstName} ${row.actor.profile.lastName}`
      : null,
    createdAt: row.createdAt,
  };
}

export function toEstateLiquidationRequestEntity(
  row: EstateLiquidationRequestWithRelations,
  options: { forStaff: boolean; history?: HistoryRow[] },
): EstateLiquidationRequestEntity {
  const comments: EstateLiquidationCommentEntity[] = options.forStaff
    ? row.comments.map((comment) => ({
        id: comment.id,
        body: comment.body,
        author: toParticipant(comment.author),
        createdAt: comment.createdAt,
      }))
    : [];

  const history: EstateLiquidationHistoryEntryEntity[] = options.forStaff
    ? (options.history ?? []).map(toHistoryEntity)
    : [];

  return {
    id: row.id,
    contactName: row.contactName,
    contactPhone: row.contactPhone,
    addressLine: row.addressLine,
    addressCity: row.addressCity,
    addressRegion: row.addressRegion,
    visitNotes: row.visitNotes,
    pieces: row.pieces.map((piece) =>
      toEstateLiquidationPieceEntity(piece, options),
    ),
    unitFee: Number(row.unitFee),
    totalFee: row.totalFee ? Number(row.totalFee) : null,
    currency: row.currency,
    paidAt: row.paidAt,
    status: row.status,
    requester: toParticipant(row.requester),
    assignedExpert: row.assignedExpert ? toParticipant(row.assignedExpert) : null,
    comments,
    history,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
