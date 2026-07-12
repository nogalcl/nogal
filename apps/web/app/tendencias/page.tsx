import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { TrendCard } from "@/components/trends/trend-card";
import { TrendCategoryFilter } from "@/components/trends/trend-category-filter";
import { fetchTrends } from "@/lib/api/trends";
import type { TrendCategory } from "@/lib/api/types";
import { TREND_CATEGORY_OPTIONS } from "@/lib/trends/constants";
import { siteConfig } from "@/lib/site";

const VALID_CATEGORIES = new Set(TREND_CATEGORY_OPTIONS.map((option) => option.value));

function parseCategory(value?: string): TrendCategory | undefined {
  return value && VALID_CATEGORIES.has(value as TrendCategory)
    ? (value as TrendCategory)
    : undefined;
}

export const metadata: Metadata = {
  title: "Tendencias",
  description:
    "Noticias, mercado, diseño, materiales, diseñadores y piezas icónicas del mundo del mobiliario y el interiorismo — la revista editorial de Nogal.",
  alternates: { canonical: `${siteConfig.url}/tendencias` },
};

interface PageProps {
  searchParams: Promise<{ categoria?: string }>;
}

export default async function TrendsPage({ searchParams }: PageProps) {
  const { categoria } = await searchParams;
  const category = parseCategory(categoria);

  const trends = await fetchTrends(category);
  const [featured, ...rest] = trends;

  return (
    <Container className="py-16">
      <div className="max-w-2xl">
        <p className="text-muted-foreground text-sm uppercase tracking-widest">
          Nogal
        </p>
        <h1 className="text-foreground mt-3 font-serif text-4xl sm:text-5xl">
          Tendencias
        </h1>
        <p className="text-muted-foreground mt-4 text-base">
          Diseño, mercado, materiales y las piezas que marcan el mobiliario y
          el interiorismo — investigado y curado, no generado. Nogal como
          fuente de conocimiento, no solo como lugar de compraventa.
        </p>
      </div>

      <div className="mt-10">
        <TrendCategoryFilter current={category} />
      </div>

      {trends.length === 0 ? (
        <p className="text-muted-foreground mt-16 text-sm">
          Aún no hay tendencias publicadas en esta categoría.
        </p>
      ) : (
        <div className="mt-14 flex flex-col gap-16">
          {featured ? <TrendCard trend={featured} featured /> : null}

          {rest.length > 0 ? (
            <div className="border-border grid gap-x-8 gap-y-14 border-t pt-14 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((trend) => (
                <TrendCard key={trend.id} trend={trend} />
              ))}
            </div>
          ) : null}
        </div>
      )}
    </Container>
  );
}
