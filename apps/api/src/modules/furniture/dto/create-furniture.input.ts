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
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";
import {
  FurnitureCondition,
  Originality,
  PriceType,
} from "@/common/graphql/furniture-enums";

const CURRENT_DECADE_CEILING = Math.ceil(new Date().getFullYear() / 10) * 10;

@InputType()
export class CreateFurnitureInput {
  @Field()
  @IsString()
  @MinLength(3, { message: "El título debe tener al menos 3 caracteres." })
  @MaxLength(140)
  title!: string;

  @Field()
  @IsString()
  @MinLength(20, {
    message: "La descripción debe tener al menos 20 caracteres.",
  })
  @MaxLength(4000)
  description!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  styleId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  designerId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  manufacturerId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  originCountryId?: string;

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

  @Field(() => FurnitureCondition, { nullable: true })
  @IsOptional()
  @IsEnum(FurnitureCondition)
  condition?: FurnitureCondition;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  conditionNotes?: string;

  @Field(() => Originality, { nullable: true })
  @IsOptional()
  @IsEnum(Originality)
  originality?: Originality;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  color?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1500)
  @Max(CURRENT_DECADE_CEILING)
  decade?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsPositive()
  @Max(1000)
  widthCm?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsPositive()
  @Max(1000)
  heightCm?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsPositive()
  @Max(1000)
  depthCm?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsPositive()
  @Max(2000)
  weightKg?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsPositive({ message: "El precio debe ser mayor que cero." })
  @Max(10_000_000)
  price?: number;

  @Field(() => PriceType, { nullable: true })
  @IsOptional()
  @IsEnum(PriceType)
  priceType?: PriceType;

  // Nogal opera solo en Chile: la ciudad es el único dato de ubicación que
  // pedimos, y es obligatorio (ver furniture-form.tsx, ya no hay selector
  // de país ni de método de envío — el retiro en persona es el único).
  @Field()
  @IsString()
  @MinLength(1, { message: "La ciudad es obligatoria." })
  @MaxLength(120)
  locationCity!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  locationRegion?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  locationCountryId?: string;
}
