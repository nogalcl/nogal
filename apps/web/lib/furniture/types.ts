export interface FurnitureFormValues {
  title: string;
  description: string;
  categoryId?: string;
  styleId?: string;
  designerId?: string;
  manufacturerId?: string;
  originCountryId?: string;
  materialIds: string[];
  woodTypeIds: string[];
  condition?: string;
  conditionNotes?: string;
  originality: string;
  color?: string;
  decade?: number;
  widthCm?: number;
  heightCm?: number;
  depthCm?: number;
  weightKg?: number;
  price?: number;
  priceType: string;
  locationCity: string;
  locationRegion?: string;
}

export const emptyFurnitureFormValues: FurnitureFormValues = {
  title: "",
  description: "",
  materialIds: [],
  woodTypeIds: [],
  originality: "ORIGINAL",
  priceType: "FIXED",
  locationCity: "",
};

export function mapFurnitureToFormValues(
  furniture: import("@/lib/api/types").Furniture,
): FurnitureFormValues {
  return {
    title: furniture.title,
    description: furniture.description,
    categoryId: furniture.category?.id,
    styleId: furniture.style?.id,
    designerId: furniture.designer?.id,
    manufacturerId: furniture.manufacturer?.id,
    originCountryId: furniture.originCountry?.id,
    materialIds: furniture.materials.map((material) => material.id),
    woodTypeIds: furniture.woodTypes.map((woodType) => woodType.id),
    condition: furniture.condition ?? undefined,
    conditionNotes: furniture.conditionNotes ?? undefined,
    originality: furniture.originality,
    color: furniture.color ?? undefined,
    decade: furniture.decade ?? undefined,
    widthCm: furniture.widthCm ?? undefined,
    heightCm: furniture.heightCm ?? undefined,
    depthCm: furniture.depthCm ?? undefined,
    weightKg: furniture.weightKg ?? undefined,
    price: furniture.price ?? undefined,
    priceType: furniture.priceType,
    locationCity: furniture.locationCity ?? "",
    locationRegion: furniture.locationRegion ?? undefined,
  };
}
