import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class AuditLogEntity {
  @Field()
  id!: string;

  @Field(() => String, { nullable: true })
  actorName?: string | null;

  @Field()
  action!: string;

  @Field(() => String, { nullable: true })
  targetType?: string | null;

  @Field(() => String, { nullable: true })
  targetId?: string | null;

  @Field()
  createdAt!: Date;
}
