import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

export function ExpressValuation() {
  return (
    <section className="bg-carbon text-beige">
      <Container className="grid gap-8 py-20 md:grid-cols-2 md:gap-16 md:py-28">
        <div>
          <p className="text-beige/60 text-sm uppercase tracking-widest">
            Servicio para vendedores
          </p>
          <h2 className="mt-4 max-w-md text-3xl leading-tight md:text-4xl">
            Valoración Express de tu pieza
          </h2>
        </div>
        <div className="flex flex-col justify-end gap-6">
          <p className="text-beige/70 max-w-md text-base">
            Antes de publicar, un especialista revisa tus fotografías y la
            historia de la pieza para ayudarte a fijar un precio justo y a
            documentar su procedencia correctamente.
          </p>
          <div>
            <Button
              variant="outline"
              className="border-beige/30 text-beige hover:bg-beige/10 hover:text-beige bg-transparent"
              asChild
            >
              <Link href="/valoracion-express">Solicitar valoración</Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
