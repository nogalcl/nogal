"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { fileReportAction } from "@/lib/reports/actions";
import type { ReportTargetType } from "@/lib/api/types";

export function ReportButton({
  targetType,
  targetId,
  label = "Reportar",
}: {
  targetType: ReportTargetType;
  targetId: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    const reason = String(formData.get("reason") ?? "").trim();
    if (!reason) return;
    startTransition(async () => {
      const result = await fileReportAction(targetType, targetId, reason);
      if (!result.error) {
        setDone(true);
        formRef.current?.reset();
      }
    });
  }

  if (done) {
    return (
      <p className="text-muted-foreground text-xs">
        Gracias, revisaremos tu reporte.
      </p>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-muted-foreground hover:text-foreground text-xs underline-offset-4 hover:underline"
      >
        {label}
      </button>
      {open ? (
        <form
          ref={formRef}
          action={handleSubmit}
          className="mt-3 flex flex-col gap-2"
        >
          <Textarea
            name="reason"
            placeholder="Cuéntanos qué está pasando…"
            rows={3}
            minLength={5}
            maxLength={500}
            required
          />
          <Button type="submit" size="sm" variant="outline" disabled={isPending}>
            Enviar reporte
          </Button>
        </form>
      ) : null}
    </div>
  );
}
