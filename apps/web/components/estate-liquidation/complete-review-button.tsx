"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { completeEstateLiquidationReviewAction } from "@/lib/estate-liquidation/actions";

export function CompleteReviewButton({
  requestId,
  allClassified,
}: {
  requestId: string;
  allClassified: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="flex flex-col gap-2">
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      <Button
        disabled={!allClassified || isPending}
        onClick={() => {
          startTransition(async () => {
            const result = await completeEstateLiquidationReviewAction(requestId);
            if (result.error) {
              setError(result.error);
              return;
            }
            router.refresh();
          });
        }}
      >
        {isPending ? "Guardando…" : "Marcar revisión completa"}
      </Button>
      {!allClassified ? (
        <p className="text-muted-foreground text-xs">
          Clasifica todas las piezas para poder completar la revisión.
        </p>
      ) : null}
    </div>
  );
}
