import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import {
  FurnitureCondition,
  FurnitureStatus,
  FurnitureValuationStatus,
  FurnitureVerificationStatus,
  Originality,
  PriceType,
  ShippingMethod,
} from "@/common/graphql/furniture-enums";
import { CountryEntity } from "@/modules/users/entities/country.entity";
import { StoreSummaryEntity } from "@/modules/stores/entities/store-summary.entity";
import { FurnitureImageEntity } from "./furniture-image.entity";
import {
  CategoryEntity,
  DesignerEntity,
  ManufacturerEntity,
  MaterialEntity,
  StyleEntity,
  WoodTypeEntity,
} from "./taxonomy.entity";

@ObjectType()
export class FurnitureEntity {
  @Field()
  id!: string;

  @Field()
  title!: string;

  @Field()
  slug!: string;

  @Field()
  description!: string;

  @Field(() => FurnitureStatus)
  status!: FurnitureStatus;

  @Field(() => String, { nullable: true })
  rejectionReason?: string | null;

  @Field(() => CategoryEntity, { nullable: true })
  category?: CategoryEntity | null;

  @Field(() => StyleEntity, { nullable: true })
  style?: StyleEntity | null;

  @Field(() => DesignerEntity, { nullable: true })
  designer?: DesignerEntity | null;

  @Field(() => ManufacturerEntity, { nullable: true })
  manufacturer?: ManufacturerEntity | null;

  @Field(() => CountryEntity, { nullable: true })
  originCountry?: CountryEntity | null;

  @Field(() => [MaterialEntity])
  materials!: MaterialEntity[];

  @Field(() => [WoodTypeEntity])
  woodTypes!: WoodTypeEntity[];

  @Field(() => FurnitureCondition, { nullable: true })
  condition?: FurnitureCondition | null;

  @Field(() => String, { nullable: true })
  conditionNotes?: string | null;

  @Field(() => Originality)
  originality!: Originality;

  @Field(() => String, { nullable: true })
  color?: string | null;

  @Field(() => Int, { nullable: true })
  decade?: number | null;

  @Field(() => Float, { nullable: true })
  widthCm?: number | null;

  @Field(() => Float, { nullable: true })
  heightCm?: number | null;

  @Field(() => Float, { nullable: true })
  depthCm?: number | null;

  @Field(() => Float, { nullable: true })
  weightKg?: number | null;

  @Field(() => Float, { nullable: true })
  price?: number | null;

  @Field()
  currency!: string;

  @Field(() => PriceType)
  priceType!: PriceType;

  @Field(() => [ShippingMethod])
  shippingMethods!: ShippingMethod[];

  @Field(() => String, { nullable: true })
  locationCity?: string | null;

  @Field(() => String, { nullable: true })
  locationRegion?: string | null;

  @Field(() => CountryEntity, { nullable: true })
  locationCountry?: CountryEntity | null;

  @Field(() => [FurnitureImageEntity])
  images!: FurnitureImageEntity[];

  @Field(() => StoreSummaryEntity)
  store!: StoreSummaryEntity;

  @Field(() => Int)
  viewCount!: number;

  // Preparado para valoración experta/asistida por IA — sin lógica todavía.
  @Field(() => Int, { nullable: true })
  confidenceLevel?: number | null;

  @Field(() => FurnitureVerificationStatus)
  verificationStatus!: FurnitureVerificationStatus;

  @Field(() => FurnitureValuationStatus)
  valuationStatus!: FurnitureValuationStatus;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
