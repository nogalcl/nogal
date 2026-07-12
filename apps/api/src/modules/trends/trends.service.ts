import { Injectable } from "@nestjs/common";
import { TrendCategory } from "@nogal/database";
import { PrismaService } from "@/modules/prisma/prisma.service";

const TREND_INCLUDE = {
  material: true,
  woodType: true,
  style: true,
  designer: { include: { country: true } },
  manufacturer: { include: { country: true } },
} as const;

@Injectable()
export class TrendsService {
  constructor(private readonly prisma: PrismaService) {}

  trends(category?: TrendCategory) {
    return this.prisma.client.trend.findMany({
      where: category ? { category } : undefined,
      include: TREND_INCLUDE,
      orderBy: { publishedAt: "desc" },
    });
  }

  trendBySlug(slug: string) {
    return this.prisma.client.trend.findUnique({
      where: { slug },
      include: TREND_INCLUDE,
    });
  }
}
