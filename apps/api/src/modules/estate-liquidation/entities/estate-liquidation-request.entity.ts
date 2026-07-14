import { Field, Float, ObjectType } from "@nestjs/graphql";
import { EstateLiquidationRequestStatus } from "@/common/graphql/estate-liquidation-enums";
import { ConversationParticipant } from "@/modules/messaging/entities/conversation.entity";
import { EstateLiquidationPieceEntity } from "./estate-liquidation-piece.entity";

@ObjectType()
export class EstateLiquidationCommentEntity {
  @Field()
  id!: string;

  @Field()
  body!: string;

  @Field(() => ConversationParticipant)
  author!: ConversationParticipant;

  @Field()
  createdAt!: Date;
}

/** Entrada de historial ya formateada — ver estate-liquidation-history.format.ts. */
@ObjectType()
export class EstateLiquidationHistoryEntryEntity {
  @Field()
  id!: string;

  @Field()
  description!: string;

  @Field(() => String, { nullable: true })
  actorName?: string | null;

  @Field()
  createdAt!: Date;
}

@ObjectType()
export class EstateLiquidationRequestEntity {
  @Field()
  id!: string;

  @Field(() => String, { nullable: true })
  contactName?: string | null;

  @Field(() => String, { nullable: true })
  contactPhone?: string | null;

  @Field(() => String, { nullable: true })
  addressLine?: string | null;

  @Field(() => String, { nullable: true })
  addressCity?: string | null;

  @Field(() => String, { nullable: true })
  addressRegion?: string | null;

  @Field(() => String, { nullable: true })
  visitNotes?: string | null;

  @Field(() => [EstateLiquidationPieceEntity])
  pieces!: EstateLiquidationPieceEntity[];

  @Field()
  unitFee!: number;

  @Field(() => Float, { nullable: true })
  totalFee?: number | null;

  @Field()
  currency!: string;

  @Field(() => Date, { nullable: true })
  paidAt?: Date | null;

  @Field(() => EstateLiquidationRequestStatus)
  status!: EstateLiquidationRequestStatus;

  @Field(() => ConversationParticipant)
  requester!: ConversationParticipant;

  @Field(() => ConversationParticipant, { nullable: true })
  assignedExpert?: ConversationParticipant | null;

  /** Vacío para el propio solicitante — solo poblado para MODERATOR/ADMIN. */
  @Field(() => [EstateLiquidationCommentEntity])
  comments!: EstateLiquidationCommentEntity[];

  /** Igual que `comments`: solo poblado para el panel experto. */
  @Field(() => [EstateLiquidationHistoryEntryEntity])
  history!: EstateLiquidationHistoryEntryEntity[];

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
