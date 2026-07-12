import type { Metadata } from "next";
import { EntityIndexPage } from "@/components/knowledge-base/entity-index";
import { fetchTaxonomyOptions } from "@/lib/api/taxonomy";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Materiales",
  description: `Materiales usados en las piezas de ${siteConfig.name}.`,
  alternates: { canonical: `${siteConfig.url}/materiales` },
};

export default async function MaterialsIndexPage() {
  const taxonomy = await fetchTaxonomyOptions();

  return (
    <EntityIndexPage
      eyebrow="Base de conocimiento"
      title="Materiales"
      description="Los materiales que definen la construcción y el carácter de cada pieza."
      breadcrumbs={[
        { label: "Inicio", href: "/" },
        { label: "Base de conocimiento", href: "/base-de-conocimiento" },
        { label: "Materiales" },
      ]}
      basePath="/materiales"
      entities={taxonomy.materials}
    />
  );
}
