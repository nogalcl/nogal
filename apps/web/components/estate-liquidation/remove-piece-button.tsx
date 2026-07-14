"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeEstateLiquidationPieceAction } from "@/lib/estate-liquidation/actions";

export function RemovePieceButton({
  pieceId,
  requestId,
}: {
  pieceId: string;
  requestId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!window.confirm("¿Quitar esta pieza de la solicitud?")) return;
        startTransition(async () => {
          await removeEstateLiquidationPieceAction(requestId, pieceId);
          router.refresh();
        });
      }}
      className="text-muted-foreground hover:text-foreground text-xs underline-offset-4 hover:underline"
    >
      Quitar pieza
    </button>
  );
}
