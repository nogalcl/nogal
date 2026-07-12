import type { Metadata } from "next";
import { AuthLink, AuthShell } from "@/components/auth/auth-shell";
import { verifyEmail } from "@/lib/api/auth";
import { extractErrorMessage } from "@/lib/api/client";

export const metadata: Metadata = { title: "Verificar correo" };

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <AuthShell eyebrow="Cuenta" title="Enlace inválido">
        <p className="text-muted-foreground text-sm">
          Falta el token de verificación.
        </p>
      </AuthShell>
    );
  }

  let error: string | null = null;
  try {
    await verifyEmail(token);
  } catch (caught) {
    error = extractErrorMessage(caught);
  }

  return (
    <AuthShell
      eyebrow="Cuenta"
      title={error ? "No pudimos verificar tu correo" : "Correo verificado"}
      footer={<AuthLink href="/cuenta">Ir a mi cuenta</AuthLink>}
    >
      <p className="text-muted-foreground text-sm">
        {error ?? "Tu dirección de correo quedó confirmada."}
      </p>
    </AuthShell>
  );
}
