import { Field, ObjectType } from "@nestjs/graphql";
import { TrendCategory } from "@/common/graphql/trend-enums";
import {
  DesignerEntity,
  ManufacturerEntity,
  MaterialEntity,
  StyleEntity,
  WoodTypeEntity,
} from "@/modules/furniture/entities/taxonomy.entity";

@ObjectType()
export class TrendEntity {
  @Field()
  id!: string;

  @Field()
  slug!: string;

  @Field()
  title!: string;

  @Field()
  excerpt!: string;

  @Field()
  body!: string;

  @Field(() => TrendCategory)
  category!: TrendCategory;

  @Field()
  imageUrl!: string;

  @Field()
  imageAlt!: string;

  @Field(() => String, { nullable: true })
  imageCredit?: string | null;

  @Field(() => MaterialEntity, { nullable: true })
  material?: MaterialEntity | null;

  @Field(() => WoodTypeEntity, { nullable: true })
  woodType?: WoodTypeEntity | null;

  @Field(() => StyleEntity, { nullable: true })
  style?: StyleEntity | null;

  @Field(() => DesignerEntity, { nullable: true })
  designer?: DesignerEntity | null;

  @Field(() => ManufacturerEntity, { nullable: true })
  manufacturer?: ManufacturerEntity | null;

  @Field()
  sourceUrl!: string;

  @Field()
  sourceName!: string;

  @Field()
  publishedAt!: Date;
}
