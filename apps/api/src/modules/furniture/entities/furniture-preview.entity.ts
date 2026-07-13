import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import { FurnitureCondition } from "@/common/graphql/furniture-enums";

@ObjectType()
export class FurniturePreviewImage {
  @Field()
  url!: string;

  @Field(() => String, { nullable: true })
  altText?: string | null;

  @Field(() => Int, { nullable: true })
  width?: number | null;

  @Field(() => Int, { nullable: true })
  height?: number | null;
}

/** Forma mínima usada en grids (explorar, categoría, diseñador, material). */
@ObjectType()
export class FurniturePreviewEntity {
  @Field()
  id!: string;

  @Field()
  title!: string;

  @Field()
  slug!: string;

  @Field(() => Float, { nullable: true })
  price?: number | null;

  @Field()
  currency!: string;

  @Field(() => Int, { nullable: true })
  decade?: number | null;

  @Field(() => FurnitureCondition, { nullable: true })
  condition?: FurnitureCondition | null;

  @Field(() => String, { nullable: true })
  locationCity?: string | null;

  @Field(() => String, { nullable: true })
  categoryName?: string | null;

  @Field(() => String, { nullable: true })
  categorySlug?: string | null;

  @Field(() => String, { nullable: true })
  primaryMaterial?: string | null;

  @Field(() => FurniturePreviewImage, { nullable: true })
  primaryImage?: FurniturePreviewImage | null;
}
