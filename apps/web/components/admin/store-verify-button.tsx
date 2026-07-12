"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { unverifyStoreAction, verifyStoreAction } from "@/lib/admin/actions";

export function StoreVerifyButton({
  id,
  isVerified,
}: {
  id: string;
  isVerified: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await (isVerified ? unverifyStoreAction(id) : verifyStoreAction(id));
          router.refresh();
        })
      }
      className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
    >
      {isVerified ? "Quitar verificación" : "Verificar"}
    </button>
  );
}
