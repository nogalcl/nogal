export interface FurnitureFormValues {
  title: string;
  description: string;
  categoryId: string;
  styleId?: string;
  designerId?: string;
  manufacturerId?: string;
  originCountryId?: string;
  materialIds: string[];
  woodTypeIds: string[];
  condition: string;
  conditionNotes?: string;
  originality: string;
  color?: string;
  decade?: number;
  widthCm?: number;
  heightCm?: number;
  depthCm?: number;
  weightKg?: number;
  price: number;
  currency: string;
  priceType: string;
  shippingMethods: string[];
  locationCity?: string;
  locationRegion?: string;
  locationCountryId?: string;
}

export const emptyFurnitureFormValues: FurnitureFormValues = {
  title: "",
  description: "",
  categoryId: "",
  materialIds: [],
  woodTypeIds: [],
  condition: "GOOD",
  originality: "ORIGINAL",
  price: 0,
  currency: "CLP",
  priceType: "FIXED",
  shippingMethods: [],
};

export function mapFurnitureToFormValues(
  furniture: import("@/lib/api/types").Furniture,
): FurnitureFormValues {
  return {
    title: furniture.title,
    description: furniture.description,
    categoryId: furniture.category.id,
    styleId: furniture.style?.id,
    designerId: furniture.designer?.id,
    manufacturerId: furniture.manufacturer?.id,
    originCountryId: furniture.originCountry?.id,
    materialIds: furniture.materials.map((material) => material.id),
    woodTypeIds: furniture.woodTypes.map((woodType) => woodType.id),
    condition: furniture.condition,
    conditionNotes: furniture.conditionNotes ?? undefined,
    originality: furniture.originality,
    color: furniture.color ?? undefined,
    decade: furniture.decade ?? undefined,
    widthCm: furniture.widthCm ?? undefined,
    heightCm: furniture.heightCm ?? undefined,
    depthCm: furniture.depthCm ?? undefined,
    weightKg: furniture.weightKg ?? undefined,
    price: furniture.price,
    currency: furniture.currency,
    priceType: furniture.priceType,
    shippingMethods: furniture.shippingMethods,
    locationCity: furniture.locationCity ?? undefined,
    locationRegion: furniture.locationRegion ?? undefined,
    locationCountryId: furniture.locationCountry?.id,
  };
}
