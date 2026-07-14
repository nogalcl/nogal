"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import { addEstateLiquidationPieceAction } from "@/lib/estate-liquidation/actions";
import type { Category } from "@/lib/api/types";

/** Agrega una pieza a la vez — cada una se persiste de inmediato al
 * enviarse (no se acumula todo en un solo submit masivo), así el progreso
 * nunca se pierde a mitad de camino si el cliente cierra la pestaña. */
export function PieceForm({
  requestId,
  categories,
}: {
  requestId: string;
  categories: Category[];
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    const title = String(formData.get("title") ?? "").trim();
    if (title.length < 1) {
      setError("Indica al menos un nombre para la pieza.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await addEstateLiquidationPieceAction({
        requestId,
        title,
        description: String(formData.get("description") ?? "").trim() || undefined,
        categoryId: String(formData.get("categoryId") ?? "") || undefined,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      formRef.current?.reset();
      router.refresh();
    });
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="border-border bg-card flex flex-col gap-4 border px-6 py-6"
    >
      <p className="text-foreground text-sm">Agregar una pieza</p>
      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      <FormField
        label="¿Qué es esta pieza?"
        name="title"
        placeholder="Ej. Ropero de cedro"
        required
      />

      <div className="flex flex-col gap-2">
        <Label htmlFor="description" className="text-foreground text-sm">
          Descripción (opcional)
        </Label>
        <Textarea
          id="description"
          name="description"
          rows={2}
          placeholder="Estado, historia, cualquier detalle que ayude"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="categoryId" className="text-foreground text-sm">
          Categoría (opcional)
        </Label>
        <Select name="categoryId">
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

      <div>
        <Button type="submit" size="sm" variant="outline" disabled={isPending}>
          {isPending ? "Agregando…" : "Agregar pieza"}
        </Button>
      </div>
    </form>
  );
}
