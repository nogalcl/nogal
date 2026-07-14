"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { setEstateLiquidationRequestStatusAction } from "@/lib/estate-liquidation/actions";
import type { EstateLiquidationRequestStatus } from "@/lib/api/types";

export function StatusActions({
  requestId,
  status,
}: {
  requestId: string;
  status: EstateLiquidationRequestStatus;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function setStatus(next: EstateLiquidationRequestStatus) {
    startTransition(async () => {
      await setEstateLiquidationRequestStatusAction(requestId, next);
      router.refresh();
    });
  }

  const canStartReview = status === "PENDING";
  const canCancel = status === "PENDING" || status === "IN_REVIEW";

  if (!canStartReview && !canCancel) return null;

  return (
    <div className="flex items-center gap-4">
      {canStartReview ? (
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => setStatus("IN_REVIEW")}
        >
          Iniciar revisión
        </Button>
      ) : null}
      {canCancel ? (
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            if (!window.confirm("¿Cancelar esta solicitud?")) return;
            setStatus("CANCELLED");
          }}
          className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
        >
          Cancelar
        </button>
      ) : null}
    </div>
  );
}
