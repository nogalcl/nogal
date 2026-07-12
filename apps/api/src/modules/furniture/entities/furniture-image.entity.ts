import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class FurnitureImageEntity {
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
