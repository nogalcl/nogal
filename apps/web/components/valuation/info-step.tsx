"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/forms/form-error";
import { FormField } from "@/components/forms/form-field";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveValuationInfoAction } from "@/lib/valuation/actions";
import type { Category, ValuationRequest } from "@/lib/api/types";

export function InfoStep({
  request,
  categories,
}: {
  request: ValuationRequest;
  categories: Category[];
}) {
  const [state, formAction, pending] = useActionState(saveValuationInfoAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div>
        <h2 className="text-foreground font-serif text-2xl">Información</h2>
        <p className="text-muted-foreground mt-2 max-w-lg text-sm">
          Cuéntanos lo que sepas — no hace falta certeza, el especialista
          confirmará los detalles.
        </p>
      </div>

      <FormError message={state?.error} />
      <input type="hidden" name="id" value={request.id} />

      <FormField
        label="¿Qué es esta pieza?"
        name="title"
        placeholder="Ej. Silla de madera heredada de mi abuela"
        defaultValue={request.title ?? ""}
        required
      />

      <div className="flex flex-col gap-2">
        <Label htmlFor="description" className="text-foreground text-sm">
          Descripción
        </Label>
        <Textarea
          id="description"
          name="description"
          rows={5}
          placeholder="Historia, procedencia, marcas visibles, estado general…"
          defaultValue={request.description ?? ""}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="categoryId" className="text-foreground text-sm">
          Categoría aproximada (opcional)
        </Label>
        <Select name="categoryId" defaultValue={request.category?.id}>
          <SelectTrigger id="categoryId">
            <SelectValue placeholder="Selecciona una categoría" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField
          label="Década aproximada (opcional)"
          name="estimatedDecade"
          type="number"
          placeholder="1960"
          defaultValue={request.estimatedDecade ?? undefined}
        />
        <FormField
          label="Ciudad (opcional)"
          name="locationCity"
          placeholder="Santiago"
          defaultValue={request.locationCity ?? ""}
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
