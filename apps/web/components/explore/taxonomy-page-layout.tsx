import { Container } from "@/components/layout/container";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/common/breadcrumbs";
import { ArticleContent } from "@/components/knowledge-base/article-content";
import { RelatedContent } from "@/components/knowledge-base/related-content";
import type { TaxonomyOptions } from "@/lib/api/taxonomy";
import type { FurnitureConnection, FurnitureSort, TaxonomyRef } from "@/lib/api/types";
import type { ExploreSearchParams } from "@/lib/explore/search-params";
import { siteConfig } from "@/lib/site";
import { ExploreGrid } from "./explore-grid";
import { FilterPanel } from "./filter-panel";
import { MobileFilterSheet } from "./mobile-filter-sheet";
import { Pagination } from "./pagination";
import { SortSelect } from "./sort-select";

interface RelatedGroupInput {
  label: string;
  basePath: string;
  items?: TaxonomyRef[];
}

interface TaxonomyPageLayoutProps {
  eyebrow: string;
  title: string;
  description?: string | null;
  /** Cuerpo largo opcional — cuando existe, sustituye el placeholder de "Historia". */
  content?: string | null;
  /** Solo aplica cuando `content` está vacío (hoy, la ficha de diseñador). */
  showHistoryPlaceholder?: boolean;
  breadcrumbs?: BreadcrumbItem[];
  relatedGroups?: RelatedGroupInput[];
  valuationMentionCount?: number;
  basePath: string;
  params: ExploreSearchParams;
  taxonomy: TaxonomyOptions;
  locations: string[];
  hiddenFacets: string[];
  result: FurnitureConnection;
  sort: FurnitureSort;
}

export function TaxonomyPageLayout({
  eyebrow,
  title,
  description,
  content,
  showHistoryPlaceholder,
  breadcrumbs,
  relatedGroups,
  valuationMentionCount,
  basePath,
  params,
  taxonomy,
  locations,
  hiddenFacets,
  result,
  sort,
}: TaxonomyPageLayoutProps) {
  const jsonLd = content
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description: description ?? undefined,
        articleBody: content,
        publisher: { "@type": "Organization", name: siteConfig.name },
      }
    : null;

  return (
    <Container className="py-16">
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}

      {breadcrumbs ? (
        <div className="mb-8">
          <Breadcrumbs items={breadcrumbs} />
        </div>
      ) : null}

      <div className="max-w-2xl">
        <p className="text-muted-foreground text-sm uppercase tracking-widest">
          {eyebrow}
        </p>
        <h1 className="text-foreground mt-3 font-serif text-4xl">{title}</h1>
        {description ? (
          <p className="text-muted-foreground mt-4 text-base">{description}</p>
        ) : null}
        {showHistoryPlaceholder && !content ? (
          <div className="mt-8">
            <p className="text-foreground text-sm">Historia</p>
            <p className="text-muted-foreground mt-2 text-sm">
              Próximamente ampliaremos la biografía y trayectoria de este
              diseñador.
            </p>
          </div>
        ) : null}
        <p className="text-muted-foreground mt-8 text-sm">
          {result.total}{" "}
          {result.total === 1 ? "pieza publicada" : "piezas publicadas"}
        </p>
      </div>

      {content ? <ArticleContent content={content} /> : null}

      <div className="mt-10 flex items-center justify-between gap-4">
        <MobileFilterSheet>
          <FilterPanel
            basePath={basePath}
            params={params}
            taxonomy={taxonomy}
            locations={locations}
            hiddenFacets={hiddenFacets}
          />
        </MobileFilterSheet>
        <SortSelect basePath={basePath} currentSort={sort} />
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <FilterPanel
            basePath={basePath}
            params={params}
            taxonomy={taxonomy}
            locations={locations}
            hiddenFacets={hiddenFacets}
          />
        </aside>

        <div>
          <ExploreGrid items={result.items} />
          <Pagination
            basePath={basePath}
            params={params}
            page={result.page}
            totalPages={result.totalPages}
          />
        </div>
      </div>

      {relatedGroups ? (
        <RelatedContent
          groups={relatedGroups}
          valuationMentionCount={valuationMentionCount}
        />
      ) : null}
    </Container>
  );
}
