"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelValuationRequestAction } from "@/lib/valuation/actions";

export function CancelRequestButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!window.confirm("¿Cancelar esta solicitud de valoración?")) return;
        startTransition(async () => {
          await cancelValuationRequestAction(id);
          router.refresh();
        });
      }}
      className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
    >
      Cancelar solicitud
    </button>
  );
}
