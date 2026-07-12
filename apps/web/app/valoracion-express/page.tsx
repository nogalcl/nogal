import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { getAccessToken } from "@/lib/auth/session";
import { startValuationRequestAndRedirectAction } from "@/lib/valuation/actions";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Valoración Express",
  description:
    "Un especialista revisa tus fotografías y la historia de tu pieza para ayudarte a fijar un precio justo.",
};

const INCLUDES = [
  "Identificación probable: diseñador, fabricante, estilo y década",
  "Materiales y tipo de madera",
  "Estado de conservación y advertencias a considerar",
  "Valor estimado, precio de venta rápida y precio de venta ideal",
  "Tiempo estimado de venta y consejos prácticos",
];

export default async function ValoracionExpressPage() {
  const accessToken = await getAccessToken();

  return (
    <Container className="py-20">
      <div className="max-w-2xl">
        <p className="text-muted-foreground text-sm uppercase tracking-widest">
          Servicio para vendedores y coleccionistas
        </p>
        <h1 className="text-foreground mt-4 font-serif text-4xl md:text-5xl">
          Valoración Express
        </h1>
        <p className="text-muted-foreground mt-6 text-lg leading-relaxed">
          Antes de vender, comprar, identificar o restaurar una pieza, un
          especialista de {siteConfig.name} revisa tus fotografías y la
          información que tengas para entregarte un informe claro y
          documentado.
        </p>
      </div>

      <div className="mt-14 grid gap-12 md:grid-cols-2">
        <div>
          <p className="text-foreground text-sm">El informe incluye</p>
          <ul className="mt-4 flex flex-col gap-3">
            {INCLUDES.map((item) => (
              <li key={item} className="text-muted-foreground text-sm">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-foreground text-sm">Cómo funciona</p>
          <ol className="text-muted-foreground mt-4 flex flex-col gap-3 text-sm">
            <li>1. Subes fotografías de la pieza.</li>
            <li>2. Completas información y tu objetivo.</li>
            <li>3. Confirmas el pago del servicio.</li>
            <li>4. Un especialista revisa tu solicitud.</li>
            <li>5. Recibes el informe completo.</li>
          </ol>
        </div>
      </div>

      <div className="mt-14">
        {accessToken ? (
          <form action={startValuationRequestAndRedirectAction}>
            <Button size="lg" type="submit">
              Comenzar valoración
            </Button>
          </form>
        ) : (
          <Button size="lg" asChild>
            <Link
              href={`/iniciar-sesion?next=${encodeURIComponent("/valoracion-express")}`}
            >
              Iniciar sesión para comenzar
            </Link>
          </Button>
        )}
        <p className="text-muted-foreground mt-4 text-sm">
          ¿Ya solicitaste una valoración?{" "}
          <Link
            href="/valoracion-express/solicitudes"
            className="text-foreground hover:underline"
          >
            Ver mis solicitudes
          </Link>
        </p>
      </div>
    </Container>
  );
}
