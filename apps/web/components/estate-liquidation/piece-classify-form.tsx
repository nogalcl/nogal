"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/form-field";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { classifyEstateLiquidationPieceAction } from "@/lib/estate-liquidation/actions";
import { CONDITION_OPTIONS } from "@/lib/furniture/constants";
import { OUTCOME_OPTIONS } from "@/lib/estate-liquidation/constants";
import type { EstateLiquidationPiece, Restorer } from "@/lib/api/types";

export function PieceClassifyForm({
  requestId,
  piece,
  restorers,
}: {
  requestId: string;
  piece: EstateLiquidationPiece;
  restorers: Restorer[];
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState(piece.outcome ?? "");
  const [restorerId, setRestorerId] = useState(piece.recommendedRestorer?.id ?? "");
  const [condition, setCondition] = useState(piece.condition ?? "");
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    if (!outcome) {
      setError("Selecciona un resultado para esta pieza.");
      return;
    }
    if (outcome === "REFER_RESTORER" && !restorerId) {
      setError("Selecciona un restaurador.");
      return;
    }
    setError(null);

    const minRaw = String(formData.get("estimatedValueMin") ?? "").trim();
    const maxRaw = String(formData.get("estimatedValueMax") ?? "").trim();
    const notes = String(formData.get("expertNotes") ?? "").trim();

    startTransition(async () => {
      const result = await classifyEstateLiquidationPieceAction(requestId, {
        pieceId: piece.id,
        outcome,
        condition: condition || undefined,
        expertNotes: notes || undefined,
        estimatedValueMin: minRaw ? Number(minRaw) : undefined,
        estimatedValueMax: maxRaw ? Number(maxRaw) : undefined,
        recommendedRestorerId:
          outcome === "REFER_RESTORER" ? restorerId : undefined,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="border-border flex flex-col gap-4 border-t py-6"
    >
      <div className="flex items-start gap-4">
        <div className="bg-muted relative size-16 shrink-0 overflow-hidden">
          {piece.images[0] ? (
            <Image
              src={piece.images[0].url}
              alt=""
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-foreground text-sm">{piece.title}</p>
          {piece.description ? (
            <p className="text-muted-foreground mt-1 text-sm">
              {piece.description}
            </p>
          ) : null}
          {piece.classifiedAt ? (
            <p className="text-muted-foreground mt-1 text-xs uppercase tracking-widest">
              Ya clasificada
            </p>
          ) : null}
        </div>
      </div>

      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-foreground text-sm">Resultado</label>
          <Select value={outcome} onValueChange={setOutcome}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un resultado" />
            </SelectTrigger>
            <SelectContent>
              {OUTCOME_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-foreground text-sm">
            Estado de conservación
          </label>
          <Select value={condition} onValueChange={setCondition}>
            <SelectTrigger>
              <SelectValue placeholder="Sin especificar" />
            </SelectTrigger>
            <SelectContent>
              {CONDITION_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {outcome === "REFER_RESTORER" ? (
        <div className="flex flex-col gap-2">
          <label className="text-foreground text-sm">Restaurador</label>
          <Select value={restorerId} onValueChange={setRestorerId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un restaurador" />
            </SelectTrigger>
            <SelectContent>
              {restorers.map((restorer) => (
                <SelectItem key={restorer.id} value={restorer.id}>
                  {restorer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Valor estimado mínimo (opcional)"
          name="estimatedValueMin"
          type="number"
          defaultValue={piece.estimatedValueMin ?? undefined}
        />
        <FormField
          label="Valor estimado máximo (opcional)"
          name="estimatedValueMax"
          type="number"
          defaultValue={piece.estimatedValueMax ?? undefined}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-foreground text-sm">
          Notas para el cliente (opcional)
        </label>
        <Textarea
          name="expertNotes"
          rows={3}
          defaultValue={piece.expertNotes ?? ""}
          placeholder="Lo que el cliente debería saber sobre esta pieza"
        />
      </div>

      <div>
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Guardando…" : "Guardar clasificación"}
        </Button>
      </div>
    </form>
  );
}
