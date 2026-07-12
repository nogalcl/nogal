import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class CountryEntity {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field()
  isoCode!: string;

  @Field()
  slug!: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => String, { nullable: true })
  content?: string | null;
}

/** Ficha completa (Base de Conocimiento) — separada de CountryEntity, que
 * se embebe en Furniture/Profile/Store/Designer/Manufacturer y no debe
 * cargar los campos relacionados computados en cada una de esas piezas. */
@ObjectType()
export class CountryDetailEntity {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field()
  isoCode!: string;

  @Field()
  slug!: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => String, { nullable: true })
  content?: string | null;

  @Field(() => Int)
  pieceCount!: number;

  @Field(() => [DesignerRef])
  relatedDesigners!: DesignerRef[];

  @Field(() => [ManufacturerRef])
  relatedManufacturers!: ManufacturerRef[];
}

/** Referencias mínimas para evitar el ciclo de import Country -> Designer ->
 * Country (Designer/Manufacturer completos viven en furniture/entities). */
@ObjectType()
class DesignerRef {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field()
  slug!: string;
}

@ObjectType()
class ManufacturerRef {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field()
  slug!: string;
}
