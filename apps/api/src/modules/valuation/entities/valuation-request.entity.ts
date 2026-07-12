import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  ValuationObjective,
  ValuationRequestStatus,
} from "@/common/graphql/valuation-enums";
import { CategoryEntity } from "@/modules/furniture/entities/taxonomy.entity";
import { ConversationParticipant } from "@/modules/messaging/entities/conversation.entity";
import { ValuationReportEntity } from "./valuation-report.entity";

@ObjectType()
export class ValuationRequestImageEntity {
  @Field()
  id!: string;

  @Field()
  url!: string;

  @Field(() => String, { nullable: true })
  altText?: string | null;

  @Field(() => Int)
  order!: number;

  @Field(() => Int, { nullable: true })
  width?: number | null;

  @Field(() => Int, { nullable: true })
  height?: number | null;
}

@ObjectType()
export class ValuationCommentEntity {
  @Field()
  id!: string;

  @Field()
  body!: string;

  @Field(() => ConversationParticipant)
  author!: ConversationParticipant;

  @Field()
  createdAt!: Date;
}

/** Entrada de historial ya formateada — ver valuation-history.format.ts. */
@ObjectType()
export class ValuationHistoryEntryEntity {
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
export class ValuationRequestEntity {
  @Field()
  id!: string;

  @Field(() => String, { nullable: true })
  title?: string | null;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => CategoryEntity, { nullable: true })
  category?: CategoryEntity | null;

  @Field(() => Int, { nullable: true })
  estimatedDecade?: number | null;

  @Field(() => String, { nullable: true })
  locationCity?: string | null;

  @Field(() => ValuationObjective, { nullable: true })
  objective?: ValuationObjective | null;

  @Field(() => [ValuationRequestImageEntity])
  images!: ValuationRequestImageEntity[];

  @Field()
  serviceFee!: number;

  @Field()
  currency!: string;

  @Field(() => Date, { nullable: true })
  paidAt?: Date | null;

  @Field(() => ValuationRequestStatus)
  status!: ValuationRequestStatus;

  @Field(() => ConversationParticipant)
  requester!: ConversationParticipant;

  @Field(() => ConversationParticipant, { nullable: true })
  assignedExpert?: ConversationParticipant | null;

  /** Vacío para el propio solicitante — solo poblado para MODERATOR/ADMIN. */
  @Field(() => [ValuationCommentEntity])
  comments!: ValuationCommentEntity[];

  /** Igual que `comments`: solo poblado para el panel experto. */
  @Field(() => [ValuationHistoryEntryEntity])
  history!: ValuationHistoryEntryEntity[];

  @Field(() => ValuationReportEntity, { nullable: true })
  report?: ValuationReportEntity | null;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
