import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Política de privacidad",
  alternates: { canonical: `${siteConfig.url}/legal/privacidad` },
};

const SECTIONS: Array<{ title: string; body: string }> = [
  {
    title: "1. Qué datos recogemos",
    body: "Datos de cuenta (nombre, correo, contraseña cifrada), perfil (usuario, biografía, ubicación si la agregas), las piezas y fotografías que publicas, los mensajes que envías a través de la plataforma, y las solicitudes de Valoración Express que realizas.",
  },
  {
    title: "2. Para qué los usamos",
    body: "Para operar tu cuenta, mostrar tus publicaciones, permitir la mensajería entre comprador y vendedor, procesar solicitudes de Valoración Express, enviar notificaciones relevantes (nuevo mensaje, respuesta a una solicitud) y mejorar el funcionamiento del sitio.",
  },
  {
    title: "3. Con quién se comparte",
    body: "No vendemos tus datos a terceros. Tu nombre de usuario, tienda y piezas publicadas son visibles públicamente, ya que ese es el propósito del sitio. Los mensajes solo son visibles para ti y el destinatario. Usamos proveedores de infraestructura (hosting, almacenamiento de imágenes, envío de correo) que procesan datos en nuestro nombre bajo las mismas condiciones de confidencialidad.",
  },
  {
    title: "4. Sesión y autenticación",
    body: "Usamos cookies estrictamente necesarias para mantener tu sesión iniciada (tokens de acceso y de renovación). No usamos cookies de publicidad ni de rastreo de terceros.",
  },
  {
    title: "5. Tus derechos",
    body: "Puedes acceder, corregir o eliminar tu información desde tu cuenta, o escribiéndonos directamente. Al eliminar tu cuenta, tus publicaciones y datos personales se retiran del sitio, salvo lo que debamos conservar por obligación legal o para resolver disputas ya iniciadas.",
  },
  {
    title: "6. Seguridad",
    body: "Las contraseñas se almacenan cifradas. El acceso a datos de usuarios dentro del equipo de Nogal está restringido a quienes lo necesitan para moderación y soporte.",
  },
  {
    title: "7. Contacto",
    body: `Para ejercer tus derechos o resolver dudas sobre esta política, escríbenos a ${siteConfig.supportEmail}.`,
  },
];

export default function PrivacyPage() {
  return (
    <Container className="py-16">
      <p className="text-muted-foreground text-sm uppercase tracking-widest">
        Legal
      </p>
      <h1 className="text-foreground mt-3 font-serif text-4xl">
        Política de privacidad
      </h1>
      <p className="text-muted-foreground mt-4 max-w-2xl text-sm">
        Esta es una versión inicial del documento, publicada junto con el
        lanzamiento del sitio, y será revisada por asesoría legal a medida
        que la plataforma incorpore pagos y nuevas funciones.
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
