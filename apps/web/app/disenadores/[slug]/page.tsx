import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TaxonomyPageLayout } from "@/components/explore/taxonomy-page-layout";
import { exploreFurniture, fetchFurnitureLocations } from "@/lib/api/explore";
import { fetchDesignerBySlug, fetchTaxonomyOptions } from "@/lib/api/taxonomy";
import {
  parseExploreParams,
  type ExploreSearchParams,
} from "@/lib/explore/search-params";
import { siteConfig } from "@/lib/site";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<ExploreSearchParams>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const designer = await fetchDesignerBySlug(slug);
  if (!designer) return { title: "Diseñador no encontrado" };

  return {
    title: designer.name,
    description:
      designer.bio ??
      `Piezas de ${designer.name} disponibles en ${siteConfig.name}.`,
    alternates: { canonical: `${siteConfig.url}/disenadores/${designer.slug}` },
  };
}

export default async function DesignerPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const urlParams = await searchParams;

  const designer = await fetchDesignerBySlug(slug);
  if (!designer) notFound();

  const taxonomy = await fetchTaxonomyOptions();
  const locations = await fetchFurnitureLocations();

  const { filter, sort } = parseExploreParams(urlParams, taxonomy);
  filter.designerIds = [designer.id];

  const result = await exploreFurniture(filter, sort);

  return (
    <TaxonomyPageLayout
      eyebrow="Diseñador"
      title={designer.name}
      description={designer.bio}
      content={designer.content}
      showHistoryPlaceholder
      breadcrumbs={[
        { label: "Inicio", href: "/" },
        { label: "Base de conocimiento", href: "/base-de-conocimiento" },
        { label: "Diseñadores", href: "/disenadores" },
        { label: designer.name },
      ]}
      relatedGroups={[
        { label: "Materiales relacionados", basePath: "/materiales", items: designer.relatedMaterials },
        { label: "Estilos relacionados", basePath: "/estilos", items: designer.relatedStyles },
      ]}
      valuationMentionCount={designer.valuationMentionCount}
      basePath={`/disenadores/${designer.slug}`}
      params={urlParams}
      taxonomy={taxonomy}
      locations={locations}
      hiddenFacets={["disenador"]}
      result={result}
      sort={sort}
    />
  );
}
