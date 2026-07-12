import type { Metadata } from "next";
import { EntityIndexPage } from "@/components/knowledge-base/entity-index";
import { fetchTaxonomyOptions } from "@/lib/api/taxonomy";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Tipos de madera",
  description: `Especies de madera presentes en el catálogo de ${siteConfig.name}.`,
  alternates: { canonical: `${siteConfig.url}/maderas` },
};

export default async function WoodTypesIndexPage() {
  const taxonomy = await fetchTaxonomyOptions();

  return (
    <EntityIndexPage
      eyebrow="Base de conocimiento"
      title="Tipos de madera"
      description="Las especies de madera más habituales en mobiliario de autor y de época."
      breadcrumbs={[
        { label: "Inicio", href: "/" },
        { label: "Base de conocimiento", href: "/base-de-conocimiento" },
        { label: "Tipos de madera" },
      ]}
      basePath="/maderas"
      entities={taxonomy.woodTypes}
    />
  );
}
