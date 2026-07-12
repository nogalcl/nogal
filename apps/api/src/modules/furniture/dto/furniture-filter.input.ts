import { Field, Float, InputType, Int } from "@nestjs/graphql";
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from "class-validator";
import {
  FurnitureCondition,
  FurnitureStatus,
  Originality,
} from "@/common/graphql/furniture-enums";

@InputType()
export class FurnitureFilterInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;

  /** Restringe a las piezas de una tienda — usado en la ficha de tienda. */
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  storeId?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsUUID(undefined, { each: true })
  categoryIds?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsUUID(undefined, { each: true })
  materialIds?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsUUID(undefined, { each: true })
  woodTypeIds?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsUUID(undefined, { each: true })
  styleIds?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsUUID(undefined, { each: true })
  designerIds?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsUUID(undefined, { each: true })
  manufacturerIds?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsUUID(undefined, { each: true })
  originCountryIds?: string[];

  @Field(() => [Int], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsInt({ each: true })
  decades?: number[];

  @Field(() => [FurnitureCondition], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(FurnitureCondition, { each: true })
  conditions?: FurnitureCondition[];

  @Field(() => [Originality], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(Originality, { each: true })
  originality?: Originality[];

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsPositive()
  priceMin?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsPositive()
  priceMax?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  locationCity?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  locationRegion?: string;

  /** Restringido a PUBLISHED/RESERVED en el repositorio — nunca expone DRAFT/SOLD/etc. */
  @Field(() => [FurnitureStatus], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(FurnitureStatus, { each: true })
  availability?: FurnitureStatus[];

  @Field(() => Int, { nullable: true, defaultValue: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @Field(() => Int, { nullable: true, defaultValue: 24 })
  @IsOptional()
  @IsInt()
  @Min(1)
  perPage?: number;
}
