import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Base de Conocimiento",
  description: `Diseñadores, fabricantes, materiales, maderas, estilos, décadas y países documentados en ${siteConfig.name}.`,
  alternates: { canonical: `${siteConfig.url}/base-de-conocimiento` },
};

const SECTIONS = [
  { href: "/disenadores", label: "Diseñadores", description: "Biografía y trayectoria de cada autor." },
  { href: "/fabricantes", label: "Fabricantes", description: "Manufacturas y talleres de producción." },
  { href: "/materiales", label: "Materiales", description: "Los materiales que definen cada pieza." },
  { href: "/maderas", label: "Tipos de madera", description: "Especies y sus características." },
  { href: "/estilos", label: "Estilos", description: "Movimientos y corrientes de diseño." },
  { href: "/decadas", label: "Décadas", description: "Contexto histórico por época." },
  { href: "/paises", label: "Países", description: "Origen geográfico de piezas y autores." },
] as const;

export default function KnowledgeBasePage() {
  return (
    <Container className="py-16">
      <p className="text-muted-foreground text-sm uppercase tracking-widest">
        {siteConfig.name}
      </p>
      <h1 className="text-foreground mt-3 font-serif text-4xl">
        Base de Conocimiento
      </h1>
      <p className="text-muted-foreground mt-4 max-w-xl text-base">
        Un archivo vivo de diseñadores, fabricantes, materiales y estilos —
        cada ficha crece a medida que documentamos más piezas.
      </p>

      <div className="border-border mt-14 grid gap-x-8 gap-y-10 border-t pt-10 sm:grid-cols-2">
        {SECTIONS.map((section) => (
          <Link key={section.href} href={section.href} className="group">
            <p className="text-foreground font-serif text-2xl group-hover:underline">
              {section.label}
            </p>
            <p className="text-muted-foreground mt-2 text-sm">
              {section.description}
            </p>
          </Link>
        ))}
      </div>
    </Container>
  );
}
