import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { ExploreGrid } from "@/components/explore/explore-grid";
import { FilterPanel } from "@/components/explore/filter-panel";
import { MobileFilterSheet } from "@/components/explore/mobile-filter-sheet";
import { Pagination } from "@/components/explore/pagination";
import { SearchInput } from "@/components/explore/search-input";
import { SortSelect } from "@/components/explore/sort-select";
import { exploreFurniture, fetchFurnitureLocations } from "@/lib/api/explore";
import { fetchTaxonomyOptions } from "@/lib/api/taxonomy";
import {
  parseExploreParams,
  type ExploreSearchParams,
} from "@/lib/explore/search-params";
import { siteConfig } from "@/lib/site";

const BASE_PATH = "/explorar";

interface PageProps {
  searchParams: Promise<ExploreSearchParams>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : undefined;

  return {
    title: q ? `Resultados para "${q}"` : "Explorar piezas",
    description:
      "Explora mobiliario de diseño, antigüedades y piezas de colección — filtra por material, estilo, diseñador, época y más.",
    // Canonical siempre apunta a la ruta sin parámetros: las combinaciones
    // de filtros no generan páginas indexables independientes, evitando
    // contenido duplicado/fino ante buscadores (ver DEVELOPMENT_RULES.md).
    alternates: { canonical: `${siteConfig.url}${BASE_PATH}` },
  };
}

export default async function ExplorePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const [taxonomy, locations] = await Promise.all([
    fetchTaxonomyOptions(),
    fetchFurnitureLocations(),
  ]);

  const { filter, sort } = parseExploreParams(params, taxonomy);
  const result = await exploreFurniture(filter, sort);

  return (
    <Container className="py-16">
      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground text-sm uppercase tracking-widest">
          Catálogo
        </p>
        <h1 className="text-foreground font-serif text-4xl">Explorar piezas</h1>
      </div>

      <div className="mt-10">
        <SearchInput basePath={BASE_PATH} params={params} />
      </div>

      <div className="mt-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <MobileFilterSheet>
            <FilterPanel
              basePath={BASE_PATH}
              params={params}
              taxonomy={taxonomy}
              locations={locations}
            />
          </MobileFilterSheet>
          <p className="text-muted-foreground text-sm">
            {result.total} {result.total === 1 ? "pieza" : "piezas"}
          </p>
        </div>
        <SortSelect basePath={BASE_PATH} currentSort={sort} />
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <FilterPanel
            basePath={BASE_PATH}
            params={params}
            taxonomy={taxonomy}
            locations={locations}
          />
        </aside>

        <div>
          <ExploreGrid items={result.items} />
          <Pagination
            basePath={BASE_PATH}
            params={params}
            page={result.page}
            totalPages={result.totalPages}
          />
        </div>
      </div>
    </Container>
  );
}
