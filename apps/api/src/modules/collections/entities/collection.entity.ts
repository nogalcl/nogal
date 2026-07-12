import { Field, Int, ObjectType } from "@nestjs/graphql";
import { FurniturePreviewEntity } from "@/modules/furniture/entities/furniture-preview.entity";

@ObjectType()
export class CollectionEntity {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  /** Presente solo en colecciones de tienda (merchandising público). */
  @Field(() => String, { nullable: true })
  storeId?: string | null;

  @Field(() => Int)
  itemCount!: number;

  @Field(() => [FurniturePreviewEntity])
  items!: FurniturePreviewEntity[];

  @Field()
  createdAt!: Date;
}
