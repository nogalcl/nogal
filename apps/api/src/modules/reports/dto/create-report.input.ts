import { Field, InputType } from "@nestjs/graphql";
import { IsEnum, IsString, IsUUID, MaxLength, MinLength } from "class-validator";
import { ReportTargetType } from "@/common/graphql/report-enums";

@InputType()
export class CreateReportInput {
  @Field(() => ReportTargetType)
  @IsEnum(ReportTargetType)
  targetType!: ReportTargetType;

  @Field()
  @IsUUID()
  targetId!: string;

  @Field()
  @IsString()
  @MinLength(5)
  @MaxLength(500)
  reason!: string;
}
