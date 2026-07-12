"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/forms/form-error";
import { saveValuationObjectiveAction } from "@/lib/valuation/actions";
import { OBJECTIVE_OPTIONS } from "@/lib/valuation/constants";
import type { ValuationRequest } from "@/lib/api/types";

export function ObjectiveStep({ request }: { request: ValuationRequest }) {
  const [state, formAction, pending] = useActionState(
    saveValuationObjectiveAction,
    null,
  );
  const [selected, setSelected] = useState(request.objective ?? "");

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div>
        <h2 className="text-foreground font-serif text-2xl">Objetivo</h2>
        <p className="text-muted-foreground mt-2 max-w-lg text-sm">
          ¿Qué buscas lograr con esta valoración?
        </p>
      </div>

      <FormError message={state?.error} />
      <input type="hidden" name="id" value={request.id} />
      <input type="hidden" name="objective" value={selected} />

      <div className="grid gap-4 sm:grid-cols-2">
        {OBJECTIVE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setSelected(option.value)}
            aria-pressed={selected === option.value}
            className={`border-border flex flex-col gap-2 border p-6 text-left transition-colors ${
              selected === option.value
                ? "border-foreground bg-muted"
                : "hover:bg-muted/50"
            }`}
          >
            <span className="text-foreground text-base">{option.label}</span>
            <span className="text-muted-foreground text-sm">
              {option.description}
            </span>
          </button>
        ))}
      </div>

      <div>
        <Button type="submit" disabled={pending || !selected}>
          {pending ? "Guardando…" : "Siguiente"}
        </Button>
      </div>
    </form>
  );
}
