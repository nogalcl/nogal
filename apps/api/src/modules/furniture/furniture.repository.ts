import { Injectable } from "@nestjs/common";
import type { FurnitureStatus, Prisma } from "@nogal/database";
import { PrismaService } from "@/modules/prisma/prisma.service";
import type { FurnitureFilterInput } from "./dto/furniture-filter.input";
import type { FurnitureSort } from "@/common/graphql/furniture-enums";
import {
  buildExploreOrderBy,
  buildExploreWhere,
  paginationFromFilter,
} from "./furniture-explore.query";

export const FURNITURE_INCLUDE = {
  category: true,
  style: true,
  designer: { include: { country: true } },
  manufacturer: { include: { country: true } },
  originCountry: true,
  locationCountry: true,
  materials: true,
  woodTypes: true,
  images: { orderBy: { order: "asc" } },
  store: true,
} satisfies Prisma.FurnitureInclude;

export type FurnitureWithRelations = Prisma.FurnitureGetPayload<{
  include: typeof FURNITURE_INCLUDE;
}>;

/**
 * Selección mínima para tarjetas de grid (explorar/categoría/diseñador/
 * material): fotografía principal, material principal, década, estado,
 * ubicación, precio — nada de descripción, bio, ni relaciones completas.
 * Evita traer datos innecesarios en listados de hasta 60 piezas.
 */
export const FURNITURE_PREVIEW_SELECT = {
  id: true,
  title: true,
  slug: true,
  price: true,
  currency: true,
  decade: true,
  condition: true,
  locationCity: true,
  category: { select: { name: true, slug: true } },
  materials: { select: { name: true }, take: 1 },
  images: {
    select: { url: true, altText: true, width: true, height: true },
    orderBy: { order: "asc" as const },
    take: 1,
  },
} satisfies Prisma.FurnitureSelect;

export type FurniturePreviewRow = Prisma.FurnitureGetPayload<{
  select: typeof FURNITURE_PREVIEW_SELECT;
}>;

@Injectable()
export class FurnitureRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<FurnitureWithRelations | null> {
    return this.prisma.client.furniture.findFirst({
      where: { id, deletedAt: null },
      include: FURNITURE_INCLUDE,
    });
  }

  findBySlug(slug: string): Promise<FurnitureWithRelations | null> {
    return this.prisma.client.furniture.findFirst({
      where: { slug, deletedAt: null },
      include: FURNITURE_INCLUDE,
    });
  }

  async slugExists(slug: string): Promise<boolean> {
    const found = await this.prisma.client.furniture.findUnique({
      where: { slug },
      select: { id: true },
    });
    return Boolean(found);
  }

  findManyByStore(storeId: string): Promise<FurnitureWithRelations[]> {
    return this.prisma.client.furniture.findMany({
      where: { storeId, deletedAt: null },
      include: FURNITURE_INCLUDE,
      orderBy: { updatedAt: "desc" },
    });
  }

  /** Cola de moderación — por defecto solo lo pendiente de revisar. */
  findManyForModeration(status?: FurnitureStatus): Promise<FurnitureWithRelations[]> {
    return this.prisma.client.furniture.findMany({
      where: { status: status ?? "UNDER_REVIEW", deletedAt: null },
      include: FURNITURE_INCLUDE,
      orderBy: { updatedAt: "asc" },
    });
  }

  create(data: Prisma.FurnitureCreateInput): Promise<FurnitureWithRelations> {
    return this.prisma.client.furniture.create({
      data,
      include: FURNITURE_INCLUDE,
    });
  }

  update(
    id: string,
    data: Prisma.FurnitureUpdateInput,
  ): Promise<FurnitureWithRelations> {
    return this.prisma.client.furniture.update({
      where: { id },
      data,
      include: FURNITURE_INCLUDE,
    });
  }

  setStatus(
    id: string,
    status: FurnitureStatus,
    extra: Prisma.FurnitureUpdateInput = {},
  ): Promise<FurnitureWithRelations> {
    return this.update(id, { status, ...extra });
  }

  softDelete(id: string): Promise<FurnitureWithRelations> {
    return this.update(id, { deletedAt: new Date() });
  }

  countImages(furnitureId: string): Promise<number> {
    return this.prisma.client.furnitureImage.count({ where: { furnitureId } });
  }

  nextImageOrder(furnitureId: string): Promise<number> {
    return this.prisma.client.furnitureImage
      .aggregate({ where: { furnitureId }, _max: { order: true } })
      .then((result) => (result._max.order ?? -1) + 1);
  }

  createImage(data: Prisma.FurnitureImageCreateInput) {
    return this.prisma.client.furnitureImage.create({ data });
  }

  findImageById(id: string) {
    return this.prisma.client.furnitureImage.findUnique({
      where: { id },
      include: { furniture: { select: { id: true, storeId: true } } },
    });
  }

  deleteImage(id: string) {
    return this.prisma.client.furnitureImage.delete({ where: { id } });
  }

  reorderImages(updates: Array<{ id: string; order: number }>) {
    return this.prisma.client.$transaction(
      updates.map(({ id, order }) =>
        this.prisma.client.furnitureImage.update({
          where: { id },
          data: { order },
        }),
      ),
    );
  }

  // ---------------------------------------------------------------------
  // Explorar (búsqueda + filtros + orden + paginación)
  // ---------------------------------------------------------------------

  /** Si alguno de los ids es una categoría padre, añade sus hijas al filtro. */
  private async expandCategoryIds(
    categoryIds?: string[],
  ): Promise<string[] | undefined> {
    if (!categoryIds?.length) return undefined;
    const children = await this.prisma.client.category.findMany({
      where: { parentId: { in: categoryIds } },
      select: { id: true },
    });
    return [...categoryIds, ...children.map((c) => c.id)];
  }

  async findManyForExplore(
    filter: FurnitureFilterInput | undefined,
    sort: FurnitureSort | undefined,
  ): Promise<{ items: FurniturePreviewRow[]; total: number }> {
    const expandedCategoryIds = await this.expandCategoryIds(
      filter?.categoryIds,
    );
    const where = buildExploreWhere(filter, expandedCategoryIds);
    const orderBy = buildExploreOrderBy(sort);
    const { skip, take } = paginationFromFilter(filter);

    const [items, total] = await this.prisma.client.$transaction([
      this.prisma.client.furniture.findMany({
        where,
        orderBy,
        skip,
        take,
        select: FURNITURE_PREVIEW_SELECT,
      }),
      this.prisma.client.furniture.count({ where }),
    ]);

    return { items, total };
  }

  async distinctLocationCities(): Promise<string[]> {
    const rows = await this.prisma.client.furniture.findMany({
      where: {
        deletedAt: null,
        status: { in: ["PUBLISHED", "RESERVED"] },
        locationCity: { not: null },
      },
      select: { locationCity: true },
      distinct: ["locationCity"],
      orderBy: { locationCity: "asc" },
    });
    return rows
      .map((row) => row.locationCity)
      .filter((city): city is string => Boolean(city));
  }
}
