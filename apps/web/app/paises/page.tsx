import type { Metadata } from "next";
import { EntityIndexPage } from "@/components/knowledge-base/entity-index";
import { fetchTaxonomyOptions } from "@/lib/api/taxonomy";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Países",
  description: `Países de origen de las piezas y diseñadores de ${siteConfig.name}.`,
  alternates: { canonical: `${siteConfig.url}/paises` },
};

export default async function CountriesIndexPage() {
  const taxonomy = await fetchTaxonomyOptions();

  return (
    <EntityIndexPage
      eyebrow="Base de conocimiento"
      title="Países"
      description="Los países de origen que dan contexto histórico y geográfico a cada pieza."
      breadcrumbs={[
        { label: "Inicio", href: "/" },
        { label: "Base de conocimiento", href: "/base-de-conocimiento" },
        { label: "Países" },
      ]}
      basePath="/paises"
      entities={taxonomy.countries.map((country) => ({
        slug: country.slug,
        name: country.name,
        description: country.description,
      }))}
    />
  );
}
