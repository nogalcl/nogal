import { Field, Int, ObjectType } from "@nestjs/graphql";
import { FurniturePreviewEntity } from "./furniture-preview.entity";

@ObjectType()
export class FurnitureConnection {
  @Field(() => [FurniturePreviewEntity])
  items!: FurniturePreviewEntity[];

  @Field(() => Int)
  total!: number;

  @Field(() => Int)
  page!: number;

  @Field(() => Int)
  perPage!: number;

  @Field(() => Int)
  totalPages!: number;
}
