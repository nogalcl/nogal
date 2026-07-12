import type { Metadata } from "next";
import { EntityIndexPage } from "@/components/knowledge-base/entity-index";
import { fetchTaxonomyOptions } from "@/lib/api/taxonomy";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Estilos",
  description: `Movimientos y estilos de diseño representados en ${siteConfig.name}.`,
  alternates: { canonical: `${siteConfig.url}/estilos` },
};

export default async function StylesIndexPage() {
  const taxonomy = await fetchTaxonomyOptions();

  return (
    <EntityIndexPage
      eyebrow="Base de conocimiento"
      title="Estilos"
      description="Movimientos y corrientes de diseño que enmarcan cada pieza."
      breadcrumbs={[
        { label: "Inicio", href: "/" },
        { label: "Base de conocimiento", href: "/base-de-conocimiento" },
        { label: "Estilos" },
      ]}
      basePath="/estilos"
      entities={taxonomy.styles}
    />
  );
}
