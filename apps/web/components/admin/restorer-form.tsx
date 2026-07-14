"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/forms/form-error";
import { FormField } from "@/components/forms/form-field";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createRestorerAction,
  updateRestorerAction,
} from "@/lib/admin/actions";
import type { ActionResult } from "@/lib/api/action-result";
import type { Restorer } from "@/lib/api/types";

/** Primer formulario de creación/edición real del panel admin — antes solo
 * había toggles. Se mantiene deliberadamente simple (FormData + server
 * action, no react-hook-form): es un formulario chico y plano, sin campos
 * repetibles ni validación condicional entre campos. */
export function RestorerForm({ restorer }: { restorer?: Restorer }) {
  const router = useRouter();

  async function action(
    _prevState: ActionResult | null,
    formData: FormData,
  ): Promise<ActionResult> {
    const name = String(formData.get("name") ?? "").trim();
    if (!name) {
      return { error: "Indica un nombre." };
    }

    const input = {
      name,
      specialty: String(formData.get("specialty") ?? "").trim() || undefined,
      phone: String(formData.get("phone") ?? "").trim() || undefined,
      email: String(formData.get("email") ?? "").trim() || undefined,
      city: String(formData.get("city") ?? "").trim() || undefined,
      notes: String(formData.get("notes") ?? "").trim() || undefined,
    };

    const result = restorer
      ? await updateRestorerAction({ id: restorer.id, ...input })
      : await createRestorerAction(input);

    if (result.success) {
      router.push("/admin/restauradores");
      router.refresh();
    }
    return result;
  }

  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <FormError message={state?.error} />

      <FormField
        label="Nombre / taller"
        name="name"
        defaultValue={restorer?.name ?? ""}
        required
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField
          label="Especialidad (opcional)"
          name="specialty"
          placeholder="Tapicería, ebanistería…"
          defaultValue={restorer?.specialty ?? ""}
        />
        <FormField
          label="Ciudad (opcional)"
          name="city"
          defaultValue={restorer?.city ?? ""}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField
          label="Teléfono (opcional)"
          name="phone"
          defaultValue={restorer?.phone ?? ""}
        />
        <FormField
          label="Correo (opcional)"
          name="email"
          type="email"
          defaultValue={restorer?.email ?? ""}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="notes" className="text-foreground text-sm">
          Notas internas (opcional)
        </Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={restorer?.notes ?? ""}
        />
      </div>

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando…" : restorer ? "Guardar cambios" : "Crear restaurador"}
        </Button>
      </div>
    </form>
  );
}
