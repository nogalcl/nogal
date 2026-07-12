import { Field, Int, ObjectType } from "@nestjs/graphql";
import { FurnitureCondition } from "@/common/graphql/furniture-enums";
import {
  DesignerEntity,
  ManufacturerEntity,
  MaterialEntity,
  StyleEntity,
  WoodTypeEntity,
} from "@/modules/furniture/entities/taxonomy.entity";
import { ConversationParticipant } from "@/modules/messaging/entities/conversation.entity";

@ObjectType()
export class ValuationReportEntity {
  @Field()
  id!: string;

  @Field()
  requestId!: string;

  @Field(() => ConversationParticipant)
  expert!: ConversationParticipant;

  @Field()
  summary!: string;

  @Field(() => String, { nullable: true })
  probableIdentification?: string | null;

  @Field(() => [MaterialEntity])
  materials!: MaterialEntity[];

  @Field(() => [WoodTypeEntity])
  woodTypes!: WoodTypeEntity[];

  @Field(() => StyleEntity, { nullable: true })
  style?: StyleEntity | null;

  @Field(() => Int, { nullable: true })
  decade?: number | null;

  @Field(() => DesignerEntity, { nullable: true })
  designer?: DesignerEntity | null;

  @Field(() => ManufacturerEntity, { nullable: true })
  manufacturer?: ManufacturerEntity | null;

  @Field(() => FurnitureCondition, { nullable: true })
  condition?: FurnitureCondition | null;

  @Field(() => String, { nullable: true })
  observations?: string | null;

  @Field(() => String, { nullable: true })
  warnings?: string | null;

  @Field()
  estimatedValueMin!: number;

  @Field()
  estimatedValueMax!: number;

  @Field(() => Number, { nullable: true })
  quickSaleValue?: number | null;

  @Field(() => Number, { nullable: true })
  idealSaleValue?: number | null;

  @Field()
  currency!: string;

  @Field(() => String, { nullable: true })
  estimatedSaleTime?: string | null;

  @Field(() => String, { nullable: true })
  tips?: string | null;

  @Field(() => Int, { nullable: true })
  confidenceLevel?: number | null;

  @Field(() => String, { nullable: true })
  pdfUrl?: string | null;

  @Field()
  providedAt!: Date;

  @Field()
  updatedAt!: Date;
}
