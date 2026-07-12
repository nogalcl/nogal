"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/forms/form-error";
import { FormField } from "@/components/forms/form-field";

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FormError message={state?.error} />
      {next ? <input type="hidden" name="next" value={next} /> : null}

      <FormField
        label="Correo electrónico"
        name="email"
        type="email"
        autoComplete="email"
        required
      />
      <FormField
        label="Contraseña"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />

      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Iniciando sesión…" : "Iniciar sesión"}
      </Button>
    </form>
  );
}
