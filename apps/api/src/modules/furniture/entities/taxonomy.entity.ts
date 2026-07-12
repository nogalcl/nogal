import { Field, Int, ObjectType } from "@nestjs/graphql";
import { CountryEntity } from "@/modules/users/entities/country.entity";

// Los campos "relacionados" (pieceCount, relatedDesigners, ...) son
// nullable a nivel de schema a propósito: solo los pueblan los resolvers
// *BySlug de la Base de Conocimiento (ver taxonomy.service.ts). En
// cualquier otro contexto donde estas entidades se embeben (Furniture.
// materials, listados de filtro, etc.) esos campos simplemente no se piden
// — si algún día se piden por error, GraphQL devuelve null en vez de
// romper la consulta completa.

@ObjectType()
export class CategoryEntity {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field()
  slug!: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => String, { nullable: true })
  content?: string | null;

  @Field(() => String, { nullable: true })
  parentId?: string | null;

  @Field(() => Int, { nullable: true })
  pieceCount?: number;

  @Field(() => [DesignerEntity], { nullable: true })
  relatedDesigners?: DesignerEntity[];

  @Field(() => [MaterialEntity], { nullable: true })
  relatedMaterials?: MaterialEntity[];
}

@ObjectType()
export class MaterialEntity {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field()
  slug!: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => String, { nullable: true })
  content?: string | null;

  @Field(() => Int, { nullable: true })
  pieceCount?: number;

  @Field(() => [DesignerEntity], { nullable: true })
  relatedDesigners?: DesignerEntity[];

  @Field(() => [ManufacturerEntity], { nullable: true })
  relatedManufacturers?: ManufacturerEntity[];

  @Field(() => Int, { nullable: true })
  valuationMentionCount?: number;
}

@ObjectType()
export class WoodTypeEntity {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field()
  slug!: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => String, { nullable: true })
  content?: string | null;

  @Field(() => Int, { nullable: true })
  pieceCount?: number;

  @Field(() => [DesignerEntity], { nullable: true })
  relatedDesigners?: DesignerEntity[];

  @Field(() => [ManufacturerEntity], { nullable: true })
  relatedManufacturers?: ManufacturerEntity[];

  @Field(() => Int, { nullable: true })
  valuationMentionCount?: number;
}

@ObjectType()
export class StyleEntity {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field()
  slug!: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => String, { nullable: true })
  content?: string | null;

  @Field(() => Int, { nullable: true })
  pieceCount?: number;

  @Field(() => [DesignerEntity], { nullable: true })
  relatedDesigners?: DesignerEntity[];

  @Field(() => [ManufacturerEntity], { nullable: true })
  relatedManufacturers?: ManufacturerEntity[];

  @Field(() => Int, { nullable: true })
  valuationMentionCount?: number;
}

@ObjectType()
export class DesignerEntity {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field()
  slug!: string;

  @Field(() => String, { nullable: true })
  bio?: string | null;

  @Field(() => String, { nullable: true })
  content?: string | null;

  @Field(() => CountryEntity, { nullable: true })
  country?: CountryEntity | null;

  @Field(() => Int, { nullable: true })
  pieceCount?: number;

  @Field(() => [MaterialEntity], { nullable: true })
  relatedMaterials?: MaterialEntity[];

  @Field(() => [StyleEntity], { nullable: true })
  relatedStyles?: StyleEntity[];

  @Field(() => Int, { nullable: true })
  valuationMentionCount?: number;
}

@ObjectType()
export class ManufacturerEntity {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field()
  slug!: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => String, { nullable: true })
  content?: string | null;

  @Field(() => CountryEntity, { nullable: true })
  country?: CountryEntity | null;

  @Field(() => Int, { nullable: true })
  pieceCount?: number;

  @Field(() => [MaterialEntity], { nullable: true })
  relatedMaterials?: MaterialEntity[];

  @Field(() => [StyleEntity], { nullable: true })
  relatedStyles?: StyleEntity[];

  @Field(() => Int, { nullable: true })
  valuationMentionCount?: number;
}

@ObjectType()
export class DecadeEntity {
  @Field()
  id!: string;

  @Field(() => Int)
  value!: number;

  @Field()
  label!: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => String, { nullable: true })
  content?: string | null;

  @Field(() => Int, { nullable: true })
  pieceCount?: number;

  @Field(() => [DesignerEntity], { nullable: true })
  relatedDesigners?: DesignerEntity[];

  @Field(() => [MaterialEntity], { nullable: true })
  relatedMaterials?: MaterialEntity[];

  @Field(() => [StyleEntity], { nullable: true })
  relatedStyles?: StyleEntity[];
}
