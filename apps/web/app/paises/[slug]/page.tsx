import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TaxonomyPageLayout } from "@/components/explore/taxonomy-page-layout";
import { exploreFurniture, fetchFurnitureLocations } from "@/lib/api/explore";
import { fetchCountryBySlug, fetchTaxonomyOptions } from "@/lib/api/taxonomy";
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
  const country = await fetchCountryBySlug(slug);
  if (!country) return { title: "País no encontrado" };

  return {
    title: country.name,
    description:
      country.description ??
      `Piezas originarias de ${country.name} disponibles en ${siteConfig.name}.`,
    alternates: { canonical: `${siteConfig.url}/paises/${country.slug}` },
  };
}

export default async function CountryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const urlParams = await searchParams;

  const country = await fetchCountryBySlug(slug);
  if (!country) notFound();

  const taxonomy = await fetchTaxonomyOptions();
  const locations = await fetchFurnitureLocations();

  const { filter, sort } = parseExploreParams(urlParams, taxonomy);
  filter.originCountryIds = [country.id];

  const result = await exploreFurniture(filter, sort);

  return (
    <TaxonomyPageLayout
      eyebrow="País de origen"
      title={country.name}
      description={country.description}
      content={country.content}
      breadcrumbs={[
        { label: "Inicio", href: "/" },
        { label: "Base de conocimiento", href: "/base-de-conocimiento" },
        { label: "Países", href: "/paises" },
        { label: country.name },
      ]}
      relatedGroups={[
        { label: "Diseñadores relacionados", basePath: "/disenadores", items: country.relatedDesigners },
        { label: "Fabricantes relacionados", basePath: "/fabricantes", items: country.relatedManufacturers },
      ]}
      basePath={`/paises/${country.slug}`}
      params={urlParams}
      taxonomy={taxonomy}
      locations={locations}
      hiddenFacets={["pais"]}
      result={result}
      sort={sort}
    />
  );
}
