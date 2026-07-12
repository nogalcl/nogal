import { Field, ObjectType } from "@nestjs/graphql";
import {
  ReportStatus,
  ReportTargetType,
} from "@/common/graphql/report-enums";

@ObjectType()
export class ReportEntity {
  @Field()
  id!: string;

  @Field()
  reporterId!: string;

  @Field(() => ReportTargetType)
  targetType!: ReportTargetType;

  @Field()
  targetId!: string;

  @Field()
  reason!: string;

  @Field(() => ReportStatus)
  status!: ReportStatus;

  @Field()
  createdAt!: Date;

  @Field(() => Date, { nullable: true })
  resolvedAt?: Date | null;
}
