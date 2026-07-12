"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { approveFurnitureAction, rejectFurnitureAction } from "@/lib/admin/actions";

export function FurnitureModerationActions({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function approve() {
    setError(null);
    startTransition(async () => {
      const result = await approveFurnitureAction(id);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  }

  function reject() {
    if (reason.trim().length < 5) {
      setError("Explica brevemente el motivo del rechazo.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await rejectFurnitureAction(id, reason.trim());
      if (result.error) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      {rejecting ? (
        <div className="flex flex-col gap-2">
          <Textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Motivo del rechazo…"
            rows={2}
          />
          <div className="flex gap-3">
            <Button size="sm" variant="destructive" onClick={reject} disabled={isPending}>
              Confirmar rechazo
            </Button>
            <Button size="sm" variant="outline" onClick={() => setRejecting(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-3">
          <Button size="sm" onClick={approve} disabled={isPending}>
            Aprobar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setRejecting(true)}
            disabled={isPending}
          >
            Rechazar
          </Button>
        </div>
      )}
    </div>
  );
}
