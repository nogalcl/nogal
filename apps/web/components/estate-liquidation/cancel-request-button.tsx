"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelEstateLiquidationRequestAction } from "@/lib/estate-liquidation/actions";

export function CancelRequestButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!window.confirm("¿Cancelar esta solicitud?")) return;
        startTransition(async () => {
          await cancelEstateLiquidationRequestAction(id);
          router.refresh();
        });
      }}
      className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
    >
      Cancelar solicitud
    </button>
  );
}
