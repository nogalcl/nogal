"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/forms/form-error";
import { FormField } from "@/components/forms/form-field";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveContactInfoAction } from "@/lib/estate-liquidation/actions";
import type { EstateLiquidationRequest } from "@/lib/api/types";

export function ContactStep({ request }: { request: EstateLiquidationRequest }) {
  const [state, formAction, pending] = useActionState(saveContactInfoAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div>
        <h2 className="text-foreground font-serif text-2xl">
          Contacto y visita
        </h2>
        <p className="text-muted-foreground mt-2 max-w-lg text-sm">
          Necesitamos estos datos para coordinar la evaluación en la
          propiedad.
        </p>
      </div>

      <FormError message={state?.error} />
      <input type="hidden" name="id" value={request.id} />

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField
          label="Nombre de contacto"
          name="contactName"
          defaultValue={request.contactName ?? ""}
          required
        />
        <FormField
          label="Teléfono"
          name="contactPhone"
          placeholder="+56 9 1234 5678"
          defaultValue={request.contactPhone ?? ""}
          required
        />
      </div>

      <FormField
        label="Dirección de la visita"
        name="addressLine"
        placeholder="Calle, número, comuna"
        defaultValue={request.addressLine ?? ""}
        required
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField
          label="Ciudad (opcional)"
          name="addressCity"
          defaultValue={request.addressCity ?? ""}
        />
        <FormField
          label="Región (opcional)"
          name="addressRegion"
          defaultValue={request.addressRegion ?? ""}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="visitNotes" className="text-foreground text-sm">
          Notas de acceso (opcional)
        </Label>
        <Textarea
          id="visitNotes"
          name="visitNotes"
          rows={3}
          placeholder="Llaves con el conserje, horario disponible, etc."
          defaultValue={request.visitNotes ?? ""}
        />
      </div>

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando…" : "Siguiente"}
        </Button>
      </div>
    </form>
  );
}
