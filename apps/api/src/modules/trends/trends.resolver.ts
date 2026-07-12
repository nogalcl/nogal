import { Args, Query, Resolver } from "@nestjs/graphql";
import { Public } from "@/common/decorators/public.decorator";
import { TrendCategory } from "@/common/graphql/trend-enums";
import { TrendEntity } from "./entities/trend.entity";
import { TrendsService } from "./trends.service";

@Resolver()
export class TrendsResolver {
  constructor(private readonly trendsService: TrendsService) {}

  @Public()
  @Query(() => [TrendEntity])
  trends(@Args("category", { type: () => TrendCategory, nullable: true }) category?: TrendCategory) {
    return this.trendsService.trends(category);
  }

  @Public()
  @Query(() => TrendEntity, { nullable: true })
  trendBySlug(@Args("slug") slug: string) {
    return this.trendsService.trendBySlug(slug);
  }
}
