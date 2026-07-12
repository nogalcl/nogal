"use client";

import { useActionState } from "react";
import { registerAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/forms/form-error";
import { FormField } from "@/components/forms/form-field";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FormError message={state?.error} />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Nombre"
          name="firstName"
          autoComplete="given-name"
          required
        />
        <FormField
          label="Apellido"
          name="lastName"
          autoComplete="family-name"
          required
        />
      </div>

      <FormField
        label="Nombre de usuario"
        name="username"
        autoComplete="username"
        pattern="[a-z0-9_.]{3,24}"
        title="Entre 3 y 24 caracteres: minúsculas, números, puntos o guiones bajos."
        required
      />
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
        autoComplete="new-password"
        minLength={10}
        required
      />
      <FormField
        label="Confirmar contraseña"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        minLength={10}
        required
      />

      <p className="text-muted-foreground text-xs">
        Mínimo 10 caracteres, con al menos una letra y un número.
      </p>

      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Creando cuenta…" : "Crear cuenta"}
      </Button>
    </form>
  );
}
