import { Field, InputType } from "@nestjs/graphql";
import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";

@InputType()
export class UpdateEstateLiquidationRequestInput {
  @Field()
  @IsUUID()
  id!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  contactName?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  contactPhone?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  addressLine?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  addressCity?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  addressRegion?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  visitNotes?: string;
}
