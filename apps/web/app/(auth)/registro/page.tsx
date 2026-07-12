import type { Metadata } from "next";
import { AuthLink, AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="Cuenta"
      title="Crear una cuenta"
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <AuthLink href="/iniciar-sesion">Inicia sesión</AuthLink>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
