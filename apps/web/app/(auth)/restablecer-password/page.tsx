import type { Metadata } from "next";
import { AuthLink, AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = { title: "Restablecer contraseña" };

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <AuthShell eyebrow="Cuenta" title="Enlace inválido">
        <p className="text-muted-foreground text-sm">
          Falta el token de restablecimiento. Solicita un nuevo enlace desde{" "}
          <AuthLink href="/recuperar-password">recuperar contraseña</AuthLink>.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell eyebrow="Cuenta" title="Restablecer contraseña">
      <ResetPasswordForm token={token} />
    </AuthShell>
  );
}
