"use client";

import { useActionState } from "react";
import { requestPasswordResetAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/forms/form-error";
import { FormField } from "@/components/forms/form-field";

export function RequestPasswordResetForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordResetAction,
    null,
  );

  if (state?.success) {
    return (
      <p className="border-border bg-card text-foreground border px-4 py-4 text-sm">
        Si existe una cuenta con ese correo, te enviamos un enlace para
        restablecer tu contraseña.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FormError message={state?.error} />

      <FormField
        label="Correo electrónico"
        name="email"
        type="email"
        autoComplete="email"
        required
      />

      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Enviando…" : "Enviar enlace"}
      </Button>
    </form>
  );
}
