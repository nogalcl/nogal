import { Field, Int, ObjectType } from "@nestjs/graphql";
import { FurniturePreviewEntity } from "@/modules/furniture/entities/furniture-preview.entity";

@ObjectType()
export class FavoriteConnection {
  @Field(() => [FurniturePreviewEntity])
  items!: FurniturePreviewEntity[];

  @Field(() => Int)
  total!: number;

  @Field(() => Int)
  page!: number;

  @Field(() => Int)
  totalPages!: number;
}
