import { Field, ObjectType } from "@nestjs/graphql";
import { RoleName } from "@/common/graphql/role-name.enum";

@ObjectType()
export class RoleEntity {
  @Field(() => RoleName)
  name!: RoleName;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => [String])
  permissions!: string[];
}
