import { Field, ObjectType } from "@nestjs/graphql";

/**
 * Forma mínima de Store para embeber en otras entidades (p. ej.
 * Furniture.store) — evita forzar los contadores en vivo de StoreEntity
 * (pieceCount/followersCount, que requieren consultas propias) en cada
 * pieza devuelta. La ficha completa de la tienda vive en `storeBySlug`.
 */
@ObjectType()
export class StoreSummaryEntity {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field()
  slug!: string;

  @Field(() => String, { nullable: true })
  bio?: string | null;

  @Field(() => String, { nullable: true })
  logoUrl?: string | null;

  @Field()
  isVerified!: boolean;

  @Field()
  createdAt!: Date;
}
