import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TaxonomyPageLayout } from "@/components/explore/taxonomy-page-layout";
import { exploreFurniture, fetchFurnitureLocations } from "@/lib/api/explore";
import { fetchTaxonomyOptions, fetchWoodTypeBySlug } from "@/lib/api/taxonomy";
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
  const woodType = await fetchWoodTypeBySlug(slug);
  if (!woodType) return { title: "Tipo de madera no encontrado" };

  return {
    title: woodType.name,
    description:
      woodType.description ??
      `Piezas en madera de ${woodType.name.toLowerCase()} disponibles en ${siteConfig.name}.`,
    alternates: { canonical: `${siteConfig.url}/maderas/${woodType.slug}` },
  };
}

export default async function WoodTypePage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const urlParams = await searchParams;

  const woodType = await fetchWoodTypeBySlug(slug);
  if (!woodType) notFound();

  const taxonomy = await fetchTaxonomyOptions();
  const locations = await fetchFurnitureLocations();

  const { filter, sort } = parseExploreParams(urlParams, taxonomy);
  filter.woodTypeIds = [woodType.id];

  const result = await exploreFurniture(filter, sort);

  return (
    <TaxonomyPageLayout
      eyebrow="Tipo de madera"
      title={woodType.name}
      description={woodType.description}
      content={woodType.content}
      breadcrumbs={[
        { label: "Inicio", href: "/" },
        { label: "Base de conocimiento", href: "/base-de-conocimiento" },
        { label: "Tipos de madera", href: "/maderas" },
        { label: woodType.name },
      ]}
      relatedGroups={[
        { label: "Diseñadores relacionados", basePath: "/disenadores", items: woodType.relatedDesigners },
        { label: "Fabricantes relacionados", basePath: "/fabricantes", items: woodType.relatedManufacturers },
      ]}
      valuationMentionCount={woodType.valuationMentionCount}
      basePath={`/maderas/${woodType.slug}`}
      params={urlParams}
      taxonomy={taxonomy}
      locations={locations}
      hiddenFacets={["madera"]}
      result={result}
      sort={sort}
    />
  );
}
