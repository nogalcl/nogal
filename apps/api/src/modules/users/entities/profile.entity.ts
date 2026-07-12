import { Field, Int, ObjectType } from "@nestjs/graphql";
import { CountryEntity } from "./country.entity";

@ObjectType()
export class ProfileEntity {
  @Field()
  id!: string;

  @Field()
  firstName!: string;

  @Field()
  lastName!: string;

  @Field()
  username!: string;

  @Field(() => String, { nullable: true })
  avatarUrl?: string | null;

  @Field(() => String, { nullable: true })
  bio?: string | null;

  @Field(() => String, { nullable: true })
  phone?: string | null;

  @Field(() => CountryEntity, { nullable: true })
  country?: CountryEntity | null;

  @Field(() => String, { nullable: true })
  region?: string | null;

  @Field(() => String, { nullable: true })
  city?: string | null;

  @Field(() => Int)
  reputation!: number;

  @Field(() => Int)
  favoritesCount!: number;

  @Field(() => Int)
  followersCount!: number;

  @Field(() => Int)
  followingCount!: number;

  @Field()
  createdAt!: Date;
}
