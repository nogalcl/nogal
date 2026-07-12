import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TaxonomyPageLayout } from "@/components/explore/taxonomy-page-layout";
import { exploreFurniture, fetchFurnitureLocations } from "@/lib/api/explore";
import { fetchStyleBySlug, fetchTaxonomyOptions } from "@/lib/api/taxonomy";
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
  const style = await fetchStyleBySlug(slug);
  if (!style) return { title: "Estilo no encontrado" };

  return {
    title: style.name,
    description:
      style.description ??
      `Piezas de estilo ${style.name.toLowerCase()} disponibles en ${siteConfig.name}.`,
    alternates: { canonical: `${siteConfig.url}/estilos/${style.slug}` },
  };
}

export default async function StylePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const urlParams = await searchParams;

  const style = await fetchStyleBySlug(slug);
  if (!style) notFound();

  const taxonomy = await fetchTaxonomyOptions();
  const locations = await fetchFurnitureLocations();

  const { filter, sort } = parseExploreParams(urlParams, taxonomy);
  filter.styleIds = [style.id];

  const result = await exploreFurniture(filter, sort);

  return (
    <TaxonomyPageLayout
      eyebrow="Estilo"
      title={style.name}
      description={style.description}
      content={style.content}
      breadcrumbs={[
        { label: "Inicio", href: "/" },
        { label: "Base de conocimiento", href: "/base-de-conocimiento" },
        { label: "Estilos", href: "/estilos" },
        { label: style.name },
      ]}
      relatedGroups={[
        { label: "Diseñadores relacionados", basePath: "/disenadores", items: style.relatedDesigners },
        { label: "Fabricantes relacionados", basePath: "/fabricantes", items: style.relatedManufacturers },
      ]}
      valuationMentionCount={style.valuationMentionCount}
      basePath={`/estilos/${style.slug}`}
      params={urlParams}
      taxonomy={taxonomy}
      locations={locations}
      hiddenFacets={["estilo"]}
      result={result}
      sort={sort}
    />
  );
}
