import type { Metadata } from "next";
import { AuthLink, AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Iniciar sesión" };

interface PageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const { next } = await searchParams;

  return (
    <AuthShell
      eyebrow="Cuenta"
      title="Iniciar sesión"
      footer={
        <>
          ¿No tienes cuenta? <AuthLink href="/registro">Regístrate</AuthLink>
          <br />
          <AuthLink href="/recuperar-password">Olvidé mi contraseña</AuthLink>
        </>
      }
    >
      <LoginForm next={next} />
    </AuthShell>
  );
}
