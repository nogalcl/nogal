import { Field, Int, ObjectType } from "@nestjs/graphql";
import { FurniturePreviewEntity } from "@/modules/furniture/entities/furniture-preview.entity";
import { CountryEntity } from "./country.entity";

@ObjectType()
export class PublicProfileStore {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field()
  slug!: string;

  @Field(() => Boolean)
  isVerified!: boolean;
}

/**
 * Vista pública de un perfil (propia o de terceros). Distinta de
 * ProfileEntity (usada en `me`) porque combina datos de Profile con
 * contadores en vivo (piezas, ventas) y el estado del vínculo social con
 * quien consulta — cosas que no tienen sentido en el contexto privado.
 */
@ObjectType()
export class PublicProfileEntity {
  @Field()
  userId!: string;

  @Field()
  username!: string;

  @Field()
  firstName!: string;

  @Field()
  lastName!: string;

  @Field(() => String, { nullable: true })
  avatarUrl?: string | null;

  @Field(() => String, { nullable: true })
  bio?: string | null;

  @Field(() => String, { nullable: true })
  city?: string | null;

  @Field(() => CountryEntity, { nullable: true })
  country?: CountryEntity | null;

  @Field()
  memberSince!: Date;

  @Field(() => Int)
  reputation!: number;

  @Field(() => Int)
  followersCount!: number;

  @Field(() => Int)
  followingCount!: number;

  @Field(() => Int)
  listingsCount!: number;

  @Field(() => Int)
  salesCount!: number;

  @Field(() => Boolean)
  isFollowedByViewer!: boolean;

  @Field(() => Boolean)
  isOwnProfile!: boolean;

  @Field(() => PublicProfileStore, { nullable: true })
  store?: PublicProfileStore | null;

  @Field(() => [FurniturePreviewEntity])
  pieces!: FurniturePreviewEntity[];
}
