import { Field, Int, ObjectType } from "@nestjs/graphql";
import { KeyValueEntity } from "@/common/graphql/key-value.entity";
import { CountryEntity } from "@/modules/users/entities/country.entity";

@ObjectType()
export class StoreEntity {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field()
  slug!: string;

  @Field(() => String, { nullable: true })
  bio?: string | null;

  @Field()
  isVerified!: boolean;

  @Field(() => String, { nullable: true })
  logoUrl?: string | null;

  @Field(() => String, { nullable: true })
  bannerUrl?: string | null;

  @Field(() => String, { nullable: true })
  websiteUrl?: string | null;

  @Field(() => [KeyValueEntity])
  socialLinks!: KeyValueEntity[];

  @Field(() => [KeyValueEntity])
  schedule!: KeyValueEntity[];

  @Field(() => String, { nullable: true })
  locationCity?: string | null;

  @Field(() => String, { nullable: true })
  locationRegion?: string | null;

  @Field(() => CountryEntity, { nullable: true })
  locationCountry?: CountryEntity | null;

  @Field()
  ownerId!: string;

  @Field(() => String, { nullable: true })
  ownerUsername?: string | null;

  @Field(() => Int)
  pieceCount!: number;

  @Field(() => Int)
  followersCount!: number;

  @Field()
  createdAt!: Date;
}
