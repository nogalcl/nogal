import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TaxonomyPageLayout } from "@/components/explore/taxonomy-page-layout";
import { exploreFurniture, fetchFurnitureLocations } from "@/lib/api/explore";
import { fetchDecadeByValue, fetchTaxonomyOptions } from "@/lib/api/taxonomy";
import {
  parseExploreParams,
  type ExploreSearchParams,
} from "@/lib/explore/search-params";
import { siteConfig } from "@/lib/site";

interface PageProps {
  params: Promise<{ valor: string }>;
  searchParams: Promise<ExploreSearchParams>;
}

function parseDecadeValue(valor: string): number | null {
  const value = Number.parseInt(valor, 10);
  return Number.isFinite(value) ? value : null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { valor } = await params;
  const value = parseDecadeValue(valor);
  const decade = value !== null ? await fetchDecadeByValue(value) : null;
  if (!decade) return { title: "Década no encontrada" };

  return {
    title: decade.label,
    description:
      decade.description ??
      `Piezas de ${decade.label.toLowerCase()} disponibles en ${siteConfig.name}.`,
    alternates: { canonical: `${siteConfig.url}/decadas/${decade.value}` },
  };
}

export default async function DecadePage({ params, searchParams }: PageProps) {
  const { valor } = await params;
  const urlParams = await searchParams;
  const value = parseDecadeValue(valor);
  if (value === null) notFound();

  const decade = await fetchDecadeByValue(value);
  if (!decade) notFound();

  const taxonomy = await fetchTaxonomyOptions();
  const locations = await fetchFurnitureLocations();

  const { filter, sort } = parseExploreParams(urlParams, taxonomy);
  filter.decades = [decade.value];

  const result = await exploreFurniture(filter, sort);

  return (
    <TaxonomyPageLayout
      eyebrow="Década"
      title={decade.label}
      description={decade.description}
      content={decade.content}
      breadcrumbs={[
        { label: "Inicio", href: "/" },
        { label: "Base de conocimiento", href: "/base-de-conocimiento" },
        { label: "Décadas", href: "/decadas" },
        { label: decade.label },
      ]}
      relatedGroups={[
        { label: "Diseñadores relacionados", basePath: "/disenadores", items: decade.relatedDesigners },
        { label: "Materiales relacionados", basePath: "/materiales", items: decade.relatedMaterials },
        { label: "Estilos relacionados", basePath: "/estilos", items: decade.relatedStyles },
      ]}
      basePath={`/decadas/${decade.value}`}
      params={urlParams}
      taxonomy={taxonomy}
      locations={locations}
      hiddenFacets={[]}
      result={result}
      sort={sort}
    />
  );
}
