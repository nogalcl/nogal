import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TaxonomyPageLayout } from "@/components/explore/taxonomy-page-layout";
import { exploreFurniture, fetchFurnitureLocations } from "@/lib/api/explore";
import { fetchMaterialBySlug, fetchTaxonomyOptions } from "@/lib/api/taxonomy";
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
  const material = await fetchMaterialBySlug(slug);
  if (!material) return { title: "Material no encontrado" };

  return {
    title: material.name,
    description:
      material.description ??
      `Piezas en ${material.name.toLowerCase()} disponibles en ${siteConfig.name}.`,
    alternates: { canonical: `${siteConfig.url}/materiales/${material.slug}` },
  };
}

export default async function MaterialPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const urlParams = await searchParams;

  const material = await fetchMaterialBySlug(slug);
  if (!material) notFound();

  const taxonomy = await fetchTaxonomyOptions();
  const locations = await fetchFurnitureLocations();

  const { filter, sort } = parseExploreParams(urlParams, taxonomy);
  filter.materialIds = [material.id];

  const result = await exploreFurniture(filter, sort);

  return (
    <TaxonomyPageLayout
      eyebrow="Material"
      title={material.name}
      description={material.description}
      content={material.content}
      breadcrumbs={[
        { label: "Inicio", href: "/" },
        { label: "Base de conocimiento", href: "/base-de-conocimiento" },
        { label: "Materiales", href: "/materiales" },
        { label: material.name },
      ]}
      relatedGroups={[
        { label: "Diseñadores relacionados", basePath: "/disenadores", items: material.relatedDesigners },
        { label: "Fabricantes relacionados", basePath: "/fabricantes", items: material.relatedManufacturers },
      ]}
      valuationMentionCount={material.valuationMentionCount}
      basePath={`/materiales/${material.slug}`}
      params={urlParams}
      taxonomy={taxonomy}
      locations={locations}
      hiddenFacets={["material"]}
      result={result}
      sort={sort}
    />
  );
}
