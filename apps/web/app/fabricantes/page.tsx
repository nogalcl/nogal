import type { Metadata } from "next";
import { EntityIndexPage } from "@/components/knowledge-base/entity-index";
import { fetchTaxonomyOptions } from "@/lib/api/taxonomy";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Fabricantes",
  description: `Casas y manufacturas de mobiliario presentes en ${siteConfig.name}.`,
  alternates: { canonical: `${siteConfig.url}/fabricantes` },
};

export default async function ManufacturersIndexPage() {
  const taxonomy = await fetchTaxonomyOptions();

  return (
    <EntityIndexPage
      eyebrow="Base de conocimiento"
      title="Fabricantes"
      description="Las manufacturas y talleres que produjeron las piezas del catálogo."
      breadcrumbs={[
        { label: "Inicio", href: "/" },
        { label: "Base de conocimiento", href: "/base-de-conocimiento" },
        { label: "Fabricantes" },
      ]}
      basePath="/fabricantes"
      entities={taxonomy.manufacturers.map((manufacturer) => ({
        slug: manufacturer.slug,
        name: manufacturer.name,
        description: manufacturer.description,
      }))}
    />
  );
}
