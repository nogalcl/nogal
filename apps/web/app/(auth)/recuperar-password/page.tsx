import type { Metadata } from "next";
import { AuthLink, AuthShell } from "@/components/auth/auth-shell";
import { RequestPasswordResetForm } from "@/components/auth/request-password-reset-form";

export const metadata: Metadata = { title: "Recuperar contraseña" };

export default function RequestPasswordResetPage() {
  return (
    <AuthShell
      eyebrow="Cuenta"
      title="Recuperar contraseña"
      description="Te enviaremos un enlace para restablecerla."
      footer={
        <AuthLink href="/iniciar-sesion">Volver a iniciar sesión</AuthLink>
      }
    >
      <RequestPasswordResetForm />
    </AuthShell>
  );
}
