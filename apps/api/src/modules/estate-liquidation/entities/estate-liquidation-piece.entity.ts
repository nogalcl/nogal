import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import { FurnitureCondition } from "@/common/graphql/furniture-enums";
import { EstateLiquidationPieceOutcome } from "@/common/graphql/estate-liquidation-enums";
import { CategoryEntity } from "@/modules/furniture/entities/taxonomy.entity";
import { ConversationParticipant } from "@/modules/messaging/entities/conversation.entity";
import { RestorerEntity } from "@/modules/restorers/entities/restorer.entity";

@ObjectType()
export class EstateLiquidationPieceImageEntity {
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
export class EstateLiquidationPieceEntity {
  @Field()
  id!: string;

  @Field()
  requestId!: string;

  @Field()
  title!: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => CategoryEntity, { nullable: true })
  category?: CategoryEntity | null;

  @Field(() => [EstateLiquidationPieceImageEntity])
  images!: EstateLiquidationPieceImageEntity[];

  @Field(() => EstateLiquidationPieceOutcome, { nullable: true })
  outcome?: EstateLiquidationPieceOutcome | null;

  @Field(() => FurnitureCondition, { nullable: true })
  condition?: FurnitureCondition | null;

  @Field(() => String, { nullable: true })
  expertNotes?: string | null;

  @Field(() => Float, { nullable: true })
  estimatedValueMin?: number | null;

  @Field(() => Float, { nullable: true })
  estimatedValueMax?: number | null;

  /** Nunca expuesto al cliente — Nogal actúa de intermediario. El mapper
   * omite este campo (junto con recommendedRestorer) cuando la vista no es
   * de staff. */
  @Field(() => RestorerEntity, { nullable: true })
  recommendedRestorer?: RestorerEntity | null;

  @Field(() => Date, { nullable: true })
  classifiedAt?: Date | null;

  @Field(() => ConversationParticipant, { nullable: true })
  classifiedBy?: ConversationParticipant | null;

  @Field(() => Int)
  order!: number;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
