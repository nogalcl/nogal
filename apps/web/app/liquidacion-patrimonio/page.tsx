import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { getAccessToken } from "@/lib/auth/session";
import { startEstateLiquidationRequestAndRedirectAction } from "@/lib/estate-liquidation/actions";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Liquidación de Patrimonio",
  description:
    "¿Heredaste una casa llena de muebles y no sabes qué hacer con ellos? Nuestro equipo evalúa cada pieza y te dice qué conviene vender, restaurar o simplemente conservar.",
};

const INCLUDES = [
  "Evaluación de cada pieza que nos indiques, una por una",
  "Recomendación clara: vender en Nogal, derivar a un restaurador de confianza, o solo informarte qué tienes",
  "Coordinación de la visita a la propiedad",
  "Un precio por pieza, no una comisión sobre lo que se venda",
];

export default async function EstateLiquidationPage() {
  const accessToken = await getAccessToken();

  return (
    <Container className="py-20">
      <div className="max-w-2xl">
        <p className="text-muted-foreground text-sm uppercase tracking-widest">
          Servicio para familias y herederos
        </p>
        <h1 className="text-foreground mt-4 font-serif text-4xl md:text-5xl">
          Liquidación de Patrimonio
        </h1>
        <p className="text-muted-foreground mt-6 text-lg leading-relaxed">
          Cuando una casa queda llena de muebles y objetos — y nadie sabe muy
          bien qué hacer con ellos — el equipo de {siteConfig.name} revisa
          pieza por pieza y te dice qué conviene hacer con cada una: vender,
          restaurar o simplemente entender qué tienes en frente.
        </p>
      </div>

      <div className="mt-14 grid gap-12 md:grid-cols-2">
        <div>
          <p className="text-foreground text-sm">El servicio incluye</p>
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
            <li>1. Nos cuentas dónde y cuándo podemos visitar.</li>
            <li>2. Agregas cada pieza con sus fotografías.</li>
            <li>3. Confirmas el pago del servicio (por pieza).</li>
            <li>4. Un especialista clasifica cada pieza.</li>
            <li>5. Recibes el resultado: qué vender, qué restaurar, qué es.</li>
          </ol>
        </div>
      </div>

      <div className="mt-14">
        {accessToken ? (
          <form action={startEstateLiquidationRequestAndRedirectAction}>
            <Button size="lg" type="submit">
              Comenzar
            </Button>
          </form>
        ) : (
          <Button size="lg" asChild>
            <Link
              href={`/iniciar-sesion?next=${encodeURIComponent("/liquidacion-patrimonio")}`}
            >
              Iniciar sesión para comenzar
            </Link>
          </Button>
        )}
        <p className="text-muted-foreground mt-4 text-sm">
          ¿Ya iniciaste una solicitud?{" "}
          <Link
            href="/liquidacion-patrimonio/solicitudes"
            className="text-foreground hover:underline"
          >
            Ver mis solicitudes
          </Link>
        </p>
      </div>
    </Container>
  );
}
