import type { Prisma } from "@nogal/database";
import { PrismaService } from "@/modules/prisma/prisma.service";

/** Estados públicos — mismo criterio que furniture-explore.query.ts, para
 * no contar ni relacionar piezas en borrador/rechazadas en las fichas de
 * Base de Conocimiento. */
const PUBLIC_STATES = ["PUBLISHED", "RESERVED", "SOLD"] as const;
const RELATED_TAKE = 6;

function scoped(where: Prisma.FurnitureWhereInput): Prisma.FurnitureWhereInput {
  return { ...where, deletedAt: null, status: { in: [...PUBLIC_STATES] } };
}

export async function countRelatedFurniture(
  prisma: PrismaService,
  where: Prisma.FurnitureWhereInput,
): Promise<number> {
  return prisma.client.furniture.count({ where: scoped(where) });
}

export async function relatedDesignersFor(
  prisma: PrismaService,
  where: Prisma.FurnitureWhereInput,
) {
  const rows = await prisma.client.furniture.findMany({
    where: { ...scoped(where), designerId: { not: null } },
    select: { designer: true },
    distinct: ["designerId"],
    take: RELATED_TAKE,
  });
  return rows.map((row) => row.designer).filter((d) => d !== null);
}

export async function relatedManufacturersFor(
  prisma: PrismaService,
  where: Prisma.FurnitureWhereInput,
) {
  const rows = await prisma.client.furniture.findMany({
    where: { ...scoped(where), manufacturerId: { not: null } },
    select: { manufacturer: true },
    distinct: ["manufacturerId"],
    take: RELATED_TAKE,
  });
  return rows.map((row) => row.manufacturer).filter((m) => m !== null);
}

export async function relatedMaterialsFor(
  prisma: PrismaService,
  where: Prisma.FurnitureWhereInput,
) {
  const rows = await prisma.client.furniture.findMany({
    where: scoped(where),
    select: { materials: true },
    take: 30,
  });
  const byId = new Map<string, (typeof rows)[number]["materials"][number]>();
  for (const row of rows) {
    for (const material of row.materials) byId.set(material.id, material);
  }
  return [...byId.values()].slice(0, RELATED_TAKE);
}

export async function relatedStylesFor(
  prisma: PrismaService,
  where: Prisma.FurnitureWhereInput,
) {
  const rows = await prisma.client.furniture.findMany({
    where: { ...scoped(where), styleId: { not: null } },
    select: { style: true },
    distinct: ["styleId"],
    take: RELATED_TAKE,
  });
  return rows.map((row) => row.style).filter((s) => s !== null);
}

export async function valuationMentionCount(
  prisma: PrismaService,
  where: Prisma.ValuationReportWhereInput,
): Promise<number> {
  return prisma.client.valuationReport.count({ where });
}
