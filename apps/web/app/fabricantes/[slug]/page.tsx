import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TaxonomyPageLayout } from "@/components/explore/taxonomy-page-layout";
import { exploreFurniture, fetchFurnitureLocations } from "@/lib/api/explore";
import { fetchManufacturerBySlug, fetchTaxonomyOptions } from "@/lib/api/taxonomy";
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
  const manufacturer = await fetchManufacturerBySlug(slug);
  if (!manufacturer) return { title: "Fabricante no encontrado" };

  return {
    title: manufacturer.name,
    description:
      manufacturer.description ??
      `Piezas de ${manufacturer.name} disponibles en ${siteConfig.name}.`,
    alternates: { canonical: `${siteConfig.url}/fabricantes/${manufacturer.slug}` },
  };
}

export default async function ManufacturerPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const urlParams = await searchParams;

  const manufacturer = await fetchManufacturerBySlug(slug);
  if (!manufacturer) notFound();

  const taxonomy = await fetchTaxonomyOptions();
  const locations = await fetchFurnitureLocations();

  const { filter, sort } = parseExploreParams(urlParams, taxonomy);
  filter.manufacturerIds = [manufacturer.id];

  const result = await exploreFurniture(filter, sort);

  return (
    <TaxonomyPageLayout
      eyebrow="Fabricante"
      title={manufacturer.name}
      description={manufacturer.description}
      content={manufacturer.content}
      breadcrumbs={[
        { label: "Inicio", href: "/" },
        { label: "Base de conocimiento", href: "/base-de-conocimiento" },
        { label: "Fabricantes", href: "/fabricantes" },
        { label: manufacturer.name },
      ]}
      relatedGroups={[
        { label: "Materiales relacionados", basePath: "/materiales", items: manufacturer.relatedMaterials },
        { label: "Estilos relacionados", basePath: "/estilos", items: manufacturer.relatedStyles },
      ]}
      valuationMentionCount={manufacturer.valuationMentionCount}
      basePath={`/fabricantes/${manufacturer.slug}`}
      params={urlParams}
      taxonomy={taxonomy}
      locations={locations}
      hiddenFacets={["fabricante"]}
      result={result}
      sort={sort}
    />
  );
}
