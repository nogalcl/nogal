import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sobre nosotros",
  description: siteConfig.description,
  alternates: { canonical: `${siteConfig.url}/sobre-nogal` },
};

export default function AboutPage() {
  return (
    <Container className="py-16">
      <p className="text-muted-foreground text-sm uppercase tracking-widest">
        Sobre Nogal
      </p>
      <h1 className="text-foreground mt-3 max-w-2xl font-serif text-4xl">
        No es un marketplace más. Es una galería que también vende.
      </h1>

      <div className="mt-10 flex max-w-2xl flex-col gap-6 text-base leading-relaxed">
        <p className="text-foreground">
          Nogal nace de una idea simple: el mobiliario de diseño, las
          antigüedades y las piezas de colección merecen un espacio que las
          trate como lo que son — objetos con historia, autoría y criterio —
          en vez de perderse en un listado genérico junto a cualquier otra
          cosa en venta.
        </p>
        <p className="text-foreground">
          Cada pieza publicada busca estar documentada: quién la diseñó,
          en qué material y década, y por qué importa. Cada vendedor pasa por
          un proceso de curaduría. Y cuando hay dudas sobre el valor de una
          pieza, nuestro servicio de{" "}
          <Link href="/valoracion-express" className="text-foreground underline underline-offset-4">
            Valoración Express
          </Link>{" "}
          pone a un especialista real a revisarla.
        </p>
        <p className="text-foreground">
          Más allá de la compraventa, creemos que Nogal debe ser también una
          fuente de conocimiento. Por eso existen la{" "}
          <Link href="/base-de-conocimiento" className="text-foreground underline underline-offset-4">
            Base de Conocimiento
          </Link>{" "}
          y{" "}
          <Link href="/tendencias" className="text-foreground underline underline-offset-4">
            Tendencias
          </Link>
          : contenido editorial e investigado sobre diseñadores, materiales,
          estilos y piezas icónicas — pensado para compradores, vendedores,
          arquitectos e interioristas por igual.
        </p>
        <p className="text-foreground">
          Estamos empezando. Si te interesa vender una pieza o simplemente
          quieres contarnos qué te gustaría ver en Nogal, escríbenos a{" "}
          <a
            href={`mailto:${siteConfig.supportEmail}`}
            className="text-foreground underline underline-offset-4"
          >
            {siteConfig.supportEmail}
          </a>
          .
        </p>
      </div>
    </Container>
  );
}
