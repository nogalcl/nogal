"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { markAllNotificationsReadAction } from "@/lib/notifications/actions";

export function MarkAllReadButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await markAllNotificationsReadAction();
          router.refresh();
        })
      }
      className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
    >
      Marcar todas como leídas
    </button>
  );
}
