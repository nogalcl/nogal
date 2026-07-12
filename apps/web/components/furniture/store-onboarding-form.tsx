"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/forms/form-error";
import { FormField } from "@/components/forms/form-field";
import { ensureStoreAction, type ActionResult } from "@/lib/furniture/actions";

async function action(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  return ensureStoreAction(name);
}

export function StoreOnboardingForm() {
  const [state, formAction, pending] = useActionState(action, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) router.refresh();
  }, [state, router]);

  return (
    <form action={formAction} className="flex max-w-sm flex-col gap-5">
      <FormError message={state?.error} />
      <FormField
        label="Nombre de tu atelier"
        name="name"
        placeholder="p. ej. Atelier Reyes"
        required
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Creando…" : "Crear atelier"}
      </Button>
    </form>
  );
}
