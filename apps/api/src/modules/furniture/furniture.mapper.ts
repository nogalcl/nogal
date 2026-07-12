import type { FurnitureEntity } from "./entities/furniture.entity";
import type { FurniturePreviewEntity } from "./entities/furniture-preview.entity";
import type {
  FurniturePreviewRow,
  FurnitureWithRelations,
} from "./furniture.repository";

/**
 * Convierte los Decimal de Prisma a number para la capa GraphQL.
 *
 * INVARIANTE: esta conversión es solo para LECTURA/visualización. El precio
 * real de una pieza vive como Prisma.Decimal en la base de datos y todo
 * filtrado/ordenamiento por precio (ver furniture.repository.ts) opera
 * contra esa columna directamente, nunca sobre este Float. Cualquier
 * cálculo monetario futuro (comisiones, totales, impuestos — sprint de
 * Pagos) DEBE operar sobre Prisma.Decimal, nunca sobre el valor devuelto
 * aquí, para evitar errores de redondeo de punto flotante.
 */
export function toFurnitureEntity(
  furniture: FurnitureWithRelations,
): FurnitureEntity {
  return {
    ...furniture,
    price: Number(furniture.price),
    widthCm: furniture.widthCm ? Number(furniture.widthCm) : null,
    heightCm: furniture.heightCm ? Number(furniture.heightCm) : null,
    depthCm: furniture.depthCm ? Number(furniture.depthCm) : null,
    weightKg: furniture.weightKg ? Number(furniture.weightKg) : null,
  } as FurnitureEntity;
}

export function toFurniturePreviewEntity(
  row: FurniturePreviewRow,
): FurniturePreviewEntity {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    price: Number(row.price),
    currency: row.currency,
    decade: row.decade,
    condition: row.condition,
    locationCity: row.locationCity,
    categoryName: row.category?.name ?? null,
    categorySlug: row.category?.slug ?? null,
    primaryMaterial: row.materials[0]?.name ?? null,
    primaryImage: row.images[0]
      ? {
          url: row.images[0].url,
          altText: row.images[0].altText,
          width: row.images[0].width,
          height: row.images[0].height,
        }
      : null,
  };
}
