import { Field, InputType } from "@nestjs/graphql";
import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";

@InputType()
export class CreateEstateLiquidationPieceInput {
  @Field()
  @IsUUID()
  requestId!: string;

  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  title!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}

@InputType()
export class UpdateEstateLiquidationPieceInput {
  @Field()
  @IsUUID()
  id!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  title?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
