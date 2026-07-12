import { Field, ObjectType } from "@nestjs/graphql";
import { RoleName } from "@/common/graphql/role-name.enum";
import { ProfileEntity } from "./profile.entity";

@ObjectType()
export class UserEntity {
  @Field()
  id!: string;

  @Field()
  email!: string;

  @Field(() => Boolean)
  emailVerified!: boolean;

  @Field(() => RoleName)
  role!: RoleName;

  @Field(() => ProfileEntity, { nullable: true })
  profile?: ProfileEntity | null;

  @Field()
  createdAt!: Date;

  /** Solo relevante en el panel admin — siempre null fuera de ese contexto. */
  @Field(() => Date, { nullable: true })
  deletedAt?: Date | null;
}
