import { Field, InputType } from "@nestjs/graphql";
import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";

@InputType()
export class CreateCollectionInput {
  @Field()
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  name!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(280)
  description?: string;

  /** Si se envía, la colección queda asociada a esa tienda (debe ser del usuario). */
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  storeId?: string;
}
