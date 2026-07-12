"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPasswordAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/forms/form-error";
import { FormField } from "@/components/forms/form-field";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(
    resetPasswordAction,
    null,
  );

  if (state?.success) {
    return (
      <div className="flex flex-col gap-4">
        <p className="border-border bg-card text-foreground border px-4 py-4 text-sm">
          Tu contraseña se actualizó correctamente.
        </p>
        <Button asChild>
          <Link href="/iniciar-sesion">Iniciar sesión</Link>
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FormError message={state?.error} />
      <input type="hidden" name="token" value={token} />

      <FormField
        label="Nueva contraseña"
        name="newPassword"
        type="password"
        autoComplete="new-password"
        minLength={10}
        required
      />
      <FormField
        label="Confirmar nueva contraseña"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        minLength={10}
        required
      />

      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Guardando…" : "Restablecer contraseña"}
      </Button>
    </form>
  );
}
