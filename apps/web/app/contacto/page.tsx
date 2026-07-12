import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contacto",
  alternates: { canonical: `${siteConfig.url}/contacto` },
};

export default function ContactPage() {
  return (
    <Container className="py-16">
      <div className="max-w-lg">
        <p className="text-muted-foreground text-sm uppercase tracking-widest">
          Contacto
        </p>
        <h1 className="text-foreground mt-3 font-serif text-4xl">
          Hablemos
        </h1>
        <p className="text-muted-foreground mt-4 text-base">
          Para consultas sobre una pieza, tu cuenta, cómo vender en Nogal, o
          cualquier otra cosa, escríbenos directamente. Respondemos por
          correo.
        </p>

        <div className="mt-8">
          <Button asChild>
            <a href={`mailto:${siteConfig.supportEmail}`}>
              Escribir a {siteConfig.supportEmail}
            </a>
          </Button>
        </div>
      </div>
    </Container>
  );
}
