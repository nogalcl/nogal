import type { Metadata } from "next";
import { EntityIndexPage } from "@/components/knowledge-base/entity-index";
import { fetchDecades } from "@/lib/api/taxonomy";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Décadas",
  description: `Piezas organizadas por década en ${siteConfig.name}.`,
  alternates: { canonical: `${siteConfig.url}/decadas` },
};

export default async function DecadesIndexPage() {
  const decades = await fetchDecades();

  return (
    <EntityIndexPage
      eyebrow="Base de conocimiento"
      title="Décadas"
      description="El contexto histórico y estético de cada década, de los años 20 a los 90."
      breadcrumbs={[
        { label: "Inicio", href: "/" },
        { label: "Base de conocimiento", href: "/base-de-conocimiento" },
        { label: "Décadas" },
      ]}
      basePath="/decadas"
      entities={decades.map((decade) => ({
        slug: String(decade.value),
        name: decade.label,
        description: decade.description,
      }))}
    />
  );
}
