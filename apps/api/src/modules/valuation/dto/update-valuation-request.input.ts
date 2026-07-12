import { Field, InputType, Int } from "@nestjs/graphql";
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";
import { ValuationObjective } from "@/common/graphql/valuation-enums";

@InputType()
export class UpdateValuationRequestInput {
  @Field()
  @IsUUID()
  id!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  title?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(3000)
  description?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1700)
  @Max(2100)
  estimatedDecade?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  locationCity?: string;

  @Field(() => ValuationObjective, { nullable: true })
  @IsOptional()
  objective?: ValuationObjective;
}
