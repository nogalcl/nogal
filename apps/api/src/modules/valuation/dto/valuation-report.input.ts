import { Field, InputType, Int } from "@nestjs/graphql";
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";
import { FurnitureCondition } from "@/common/graphql/furniture-enums";

@InputType()
export class ValuationReportInput {
  @Field()
  @IsUUID()
  requestId!: string;

  @Field()
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  summary!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  probableIdentification?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsUUID(undefined, { each: true })
  materialIds?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsUUID(undefined, { each: true })
  woodTypeIds?: string[];

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  styleId?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1700)
  @Max(2100)
  decade?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  designerId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  manufacturerId?: string;

  @Field(() => FurnitureCondition, { nullable: true })
  @IsOptional()
  @IsEnum(FurnitureCondition)
  condition?: FurnitureCondition;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observations?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  warnings?: string;

  @Field()
  @IsNumber()
  @IsPositive()
  estimatedValueMin!: number;

  @Field()
  @IsNumber()
  @IsPositive()
  estimatedValueMax!: number;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  quickSaleValue?: number;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  idealSaleValue?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  estimatedSaleTime?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  tips?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  confidenceLevel?: number;
}
