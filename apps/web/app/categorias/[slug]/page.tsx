import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TaxonomyPageLayout } from "@/components/explore/taxonomy-page-layout";
import { exploreFurniture, fetchFurnitureLocations } from "@/lib/api/explore";
import { fetchCategoryBySlug, fetchTaxonomyOptions } from "@/lib/api/taxonomy";
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
  const category = await fetchCategoryBySlug(slug);
  if (!category) return { title: "Categoría no encontrada" };

  return {
    title: category.name,
    description:
      category.description ??
      `Explora ${category.name.toLowerCase()} de diseño, antigüedades y colección en ${siteConfig.name}.`,
    alternates: { canonical: `${siteConfig.url}/categorias/${category.slug}` },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const urlParams = await searchParams;

  const category = await fetchCategoryBySlug(slug);
  if (!category) notFound();

  const taxonomy = await fetchTaxonomyOptions();
  const locations = await fetchFurnitureLocations();

  const { filter, sort } = parseExploreParams(urlParams, taxonomy);
  filter.categoryIds = [category.id];

  const result = await exploreFurniture(filter, sort);

  return (
    <TaxonomyPageLayout
      eyebrow="Categoría"
      title={category.name}
      description={category.description}
      content={category.content}
      breadcrumbs={[
        { label: "Inicio", href: "/" },
        { label: "Explorar", href: "/explorar" },
        { label: category.name },
      ]}
      relatedGroups={[
        { label: "Diseñadores relacionados", basePath: "/disenadores", items: category.relatedDesigners },
        { label: "Materiales relacionados", basePath: "/materiales", items: category.relatedMaterials },
      ]}
      basePath={`/categorias/${category.slug}`}
      params={urlParams}
      taxonomy={taxonomy}
      locations={locations}
      hiddenFacets={["categoria"]}
      result={result}
      sort={sort}
    />
  );
}
