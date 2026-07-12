import type { Metadata } from "next";
import { EntityIndexPage } from "@/components/knowledge-base/entity-index";
import { fetchTaxonomyOptions } from "@/lib/api/taxonomy";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Diseñadores",
  description: `Diseñadores de mobiliario de autor documentados en ${siteConfig.name}.`,
  alternates: { canonical: `${siteConfig.url}/disenadores` },
};

export default async function DesignersIndexPage() {
  const taxonomy = await fetchTaxonomyOptions();

  return (
    <EntityIndexPage
      eyebrow="Base de conocimiento"
      title="Diseñadores"
      description="Biografías y trayectoria de los diseñadores presentes en el catálogo."
      breadcrumbs={[
        { label: "Inicio", href: "/" },
        { label: "Base de conocimiento", href: "/base-de-conocimiento" },
        { label: "Diseñadores" },
      ]}
      basePath="/disenadores"
      entities={taxonomy.designers.map((designer) => ({
        slug: designer.slug,
        name: designer.name,
        description: designer.bio,
      }))}
    />
  );
}
