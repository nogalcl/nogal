import type { Prisma } from "@nogal/database";
import {
  FurnitureSort,
  FurnitureStatus,
} from "@/common/graphql/furniture-enums";
import type { FurnitureFilterInput } from "./dto/furniture-filter.input";

const PUBLIC_STATES: FurnitureStatus[] = [
  FurnitureStatus.PUBLISHED,
  FurnitureStatus.RESERVED,
];

/**
 * Construye el `where` de Prisma a partir de los filtros del explorador.
 * Función pura (sin acceso a BD) para poder testearla de forma aislada —
 * la expansión de categoría padre → hijas se resuelve antes, en el
 * repositorio, y se pasa ya lista en `expandedCategoryIds`.
 */
export function buildExploreWhere(
  filter: FurnitureFilterInput | undefined,
  expandedCategoryIds?: string[],
): Prisma.FurnitureWhereInput {
  const requestedAvailability = filter?.availability?.filter((status) =>
    PUBLIC_STATES.includes(status),
  );
  const availability =
    requestedAvailability && requestedAvailability.length > 0
      ? requestedAvailability
      : PUBLIC_STATES;

  const where: Prisma.FurnitureWhereInput = {
    deletedAt: null,
    status: { in: availability },
  };

  if (expandedCategoryIds && expandedCategoryIds.length > 0) {
    where.categoryId = { in: expandedCategoryIds };
  }
  if (filter?.storeId) {
    where.storeId = filter.storeId;
  }
  if (filter?.materialIds?.length) {
    where.materials = { some: { id: { in: filter.materialIds } } };
  }
  if (filter?.woodTypeIds?.length) {
    where.woodTypes = { some: { id: { in: filter.woodTypeIds } } };
  }
  if (filter?.styleIds?.length) {
    where.styleId = { in: filter.styleIds };
  }
  if (filter?.designerIds?.length) {
    where.designerId = { in: filter.designerIds };
  }
  if (filter?.manufacturerIds?.length) {
    where.manufacturerId = { in: filter.manufacturerIds };
  }
  if (filter?.originCountryIds?.length) {
    where.originCountryId = { in: filter.originCountryIds };
  }
  if (filter?.decades?.length) {
    where.decade = { in: filter.decades };
  }
  if (filter?.conditions?.length) {
    where.condition = { in: filter.conditions };
  }
  if (filter?.originality?.length) {
    where.originality = { in: filter.originality };
  }
  if (filter?.priceMin !== undefined || filter?.priceMax !== undefined) {
    where.price = {
      ...(filter.priceMin !== undefined ? { gte: filter.priceMin } : {}),
      ...(filter.priceMax !== undefined ? { lte: filter.priceMax } : {}),
    };
  }
  if (filter?.locationCity) {
    where.locationCity = { equals: filter.locationCity, mode: "insensitive" };
  }
  if (filter?.locationRegion) {
    where.locationRegion = {
      equals: filter.locationRegion,
      mode: "insensitive",
    };
  }

  if (filter?.q?.trim()) {
    const q = filter.q.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { designer: { name: { contains: q, mode: "insensitive" } } },
      { manufacturer: { name: { contains: q, mode: "insensitive" } } },
      { style: { name: { contains: q, mode: "insensitive" } } },
      { category: { name: { contains: q, mode: "insensitive" } } },
      { originCountry: { name: { contains: q, mode: "insensitive" } } },
      { locationCity: { contains: q, mode: "insensitive" } },
      { materials: { some: { name: { contains: q, mode: "insensitive" } } } },
      { woodTypes: { some: { name: { contains: q, mode: "insensitive" } } } },
    ];
  }

  return where;
}

export function buildExploreOrderBy(
  sort: FurnitureSort | undefined,
): Prisma.FurnitureOrderByWithRelationInput {
  switch (sort) {
    case FurnitureSort.OLDEST:
      return { createdAt: "asc" };
    case FurnitureSort.PRICE_ASC:
      return { price: "asc" };
    case FurnitureSort.PRICE_DESC:
      return { price: "desc" };
    case FurnitureSort.MOST_VIEWED:
      return { viewCount: "desc" };
    case FurnitureSort.MOST_SAVED:
      return { favorites: { _count: "desc" } };
    case FurnitureSort.RECENT:
    default:
      return { createdAt: "desc" };
  }
}

const MAX_PER_PAGE = 60;
const DEFAULT_PER_PAGE = 24;

export function paginationFromFilter(filter: FurnitureFilterInput | undefined) {
  const page = Math.max(1, filter?.page ?? 1);
  const perPage = Math.min(
    MAX_PER_PAGE,
    Math.max(1, filter?.perPage ?? DEFAULT_PER_PAGE),
  );
  return { page, perPage, skip: (page - 1) * perPage, take: perPage };
}
