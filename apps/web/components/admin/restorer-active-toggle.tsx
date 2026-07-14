"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setRestorerActiveAction } from "@/lib/admin/actions";

export function RestorerActiveToggle({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await setRestorerActiveAction(id, !isActive);
          router.refresh();
        })
      }
      className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
    >
      {isActive ? "Desactivar" : "Activar"}
    </button>
  );
}
