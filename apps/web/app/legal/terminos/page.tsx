import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Términos de servicio",
  alternates: { canonical: `${siteConfig.url}/legal/terminos` },
};

const SECTIONS: Array<{ title: string; body: string }> = [
  {
    title: "1. Qué es Nogal",
    body: "Nogal es un espacio para publicar, descubrir y contactar sobre mobiliario de diseño, antigüedades y piezas de colección. Conecta a compradores y vendedores; no es (todavía) una pasarela de pago ni actúa como parte de la transacción comercial entre ambos.",
  },
  {
    title: "2. Cuentas de usuario",
    body: "Para publicar piezas, guardar favoritos, enviar mensajes o solicitar una Valoración Express es necesario crear una cuenta con un correo válido. Eres responsable de mantener la confidencialidad de tu contraseña y de toda actividad realizada desde tu cuenta.",
  },
  {
    title: "3. Publicación de piezas",
    body: "Quien publica una pieza es responsable de que la descripción, fotografías, procedencia y estado declarado sean veraces. Nogal puede moderar, solicitar información adicional o retirar publicaciones que incumplan estas condiciones o que resulten engañosas.",
  },
  {
    title: "4. Cómo se cierran las operaciones",
    body: "El contacto entre comprador y vendedor ocurre a través de la mensajería del sitio. Actualmente, el pago y la entrega de la pieza se acuerdan y ejecutan directamente entre ambas partes, fuera de la plataforma — Nogal no procesa el pago ni garantiza la operación. Recomendamos verificar la identidad de la otra parte y las condiciones de entrega antes de transferir dinero.",
  },
  {
    title: "5. Valoración Express",
    body: "La Valoración Express es una opinión informada entregada por un especialista de Nogal sobre una pieza, basada en las fotografías e información proporcionadas. No constituye una tasación oficial, pericial o con validez legal, y no garantiza un precio de venta.",
  },
  {
    title: "6. Contenido editorial",
    body: "Las secciones de Tendencias y Base de Conocimiento son contenido editorial elaborado por Nogal con fines informativos. Las fotografías utilizadas provienen de fuentes de licencia libre y se atribuyen a su autor cuando corresponde.",
  },
  {
    title: "7. Conducta prohibida",
    body: "No está permitido publicar piezas falsificadas o de procedencia ilícita, suplantar identidad, usar la mensajería para fines distintos a la negociación de piezas, ni intentar vulnerar la seguridad del sitio.",
  },
  {
    title: "8. Limitación de responsabilidad",
    body: "Nogal facilita el contacto entre las partes pero no participa en la transacción final. En la medida permitida por la ley, Nogal no es responsable por disputas, daños o pérdidas derivadas de acuerdos entre comprador y vendedor.",
  },
  {
    title: "9. Cambios a estos términos",
    body: "Podemos actualizar estos términos a medida que la plataforma evoluciona (por ejemplo, al incorporar pagos dentro del sitio). Publicaremos la fecha de la última actualización en esta misma página.",
  },
  {
    title: "10. Contacto",
    body: `Para consultas sobre estos términos, escríbenos a ${siteConfig.supportEmail}.`,
  },
];

export default function TermsPage() {
  return (
    <Container className="py-16">
      <p className="text-muted-foreground text-sm uppercase tracking-widest">
        Legal
      </p>
      <h1 className="text-foreground mt-3 font-serif text-4xl">
        Términos de servicio
      </h1>
      <p className="text-muted-foreground mt-4 max-w-2xl text-sm">
        Esta es una versión inicial del documento, publicada junto con el
        lanzamiento del sitio. Será revisada por asesoría legal antes de
        procesar pagos dentro de la plataforma.
      </p>

      <div className="mt-10 flex max-w-2xl flex-col gap-8">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <h2 className="text-foreground font-serif text-xl">{section.title}</h2>
            <p className="text-foreground mt-2 text-base leading-relaxed">
              {section.body}
            </p>
          </div>
        ))}
      </div>
    </Container>
  );
}
