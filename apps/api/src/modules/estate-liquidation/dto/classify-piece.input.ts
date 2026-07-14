import { Field, Float, InputType } from "@nestjs/graphql";
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
} from "class-validator";
import { FurnitureCondition } from "@/common/graphql/furniture-enums";
import { EstateLiquidationPieceOutcome } from "@/common/graphql/estate-liquidation-enums";

@InputType()
export class ClassifyPieceInput {
  @Field()
  @IsUUID()
  pieceId!: string;

  @Field(() => EstateLiquidationPieceOutcome)
  @IsEnum(EstateLiquidationPieceOutcome)
  outcome!: EstateLiquidationPieceOutcome;

  @Field(() => FurnitureCondition, { nullable: true })
  @IsOptional()
  @IsEnum(FurnitureCondition)
  condition?: FurnitureCondition;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  expertNotes?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  estimatedValueMin?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  estimatedValueMax?: number;

  /** Requerido si y solo si outcome = REFER_RESTORER — validado en el
   * service, no aquí (depende de otro campo del mismo input). */
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  recommendedRestorerId?: string;
}
