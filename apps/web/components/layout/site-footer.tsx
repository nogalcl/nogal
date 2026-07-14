import Link from "next/link";

import { NogalMark } from "@/components/brand/nogal-mark";
import { Container } from "@/components/layout/container";
import { siteConfig } from "@/lib/site";

const columns = [
  {
    title: "Explorar",
    links: [
      { href: "/explorar", label: "Piezas" },
      { href: "/colecciones", label: "Colecciones" },
      { href: "/ateliers", label: "Ateliers" },
      { href: "/base-de-conocimiento", label: "Base de conocimiento" },
      { href: "/tendencias", label: "Tendencias" },
    ],
  },
  {
    title: "Vender",
    links: [
      { href: "/vender", label: "Publicar una pieza" },
      { href: "/valoracion-express", label: "Valoración Express" },
      { href: "/liquidacion-patrimonio", label: "Liquidación de Patrimonio" },
    ],
  },
  {
    title: "Nogal",
    links: [
      { href: "/sobre-nogal", label: "Sobre nosotros" },
      { href: "/contacto", label: "Contacto" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-border bg-background border-t">
      <Container className="py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <NogalMark className="text-primary h-8 w-8" />
            <p className="text-foreground mt-3 font-serif text-2xl">
              {siteConfig.name}
            </p>
            <p className="text-muted-foreground mt-4 max-w-xs text-sm">
              {siteConfig.tagline}.
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <p className="text-foreground text-sm font-medium">
                {column.title}
              </p>
              <ul className="mt-4 flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-border text-muted-foreground mt-16 flex flex-col gap-4 border-t pt-8 text-xs md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. Todos los derechos
            reservados.
          </p>
          <div className="flex gap-6">
            <Link href="/legal/privacidad" className="hover:text-foreground">
              Privacidad
            </Link>
            <Link href="/legal/terminos" className="hover:text-foreground">
              Términos
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
