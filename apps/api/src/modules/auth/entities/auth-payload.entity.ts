import { Field, Int, ObjectType } from "@nestjs/graphql";
import { UserEntity } from "@/modules/users/entities/user.entity";

@ObjectType()
export class AuthPayload {
  @Field()
  accessToken!: string;

  @Field(() => Int)
  accessTokenExpiresInSeconds!: number;

  @Field()
  refreshToken!: string;

  @Field()
  refreshTokenExpiresAt!: Date;

  @Field(() => UserEntity)
  user!: UserEntity;
}
