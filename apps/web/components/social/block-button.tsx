"use client";

import { useState, useTransition } from "react";
import { blockUserAction, unblockUserAction } from "@/lib/social/actions";

export function BlockButton({
  userId,
  initialIsBlocked = false,
}: {
  userId: string;
  initialIsBlocked?: boolean;
}) {
  const [isBlocked, setIsBlocked] = useState(initialIsBlocked);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    if (!isBlocked && !window.confirm("¿Bloquear a este usuario? No podrá enviarte mensajes.")) {
      return;
    }
    const next = !isBlocked;
    setIsBlocked(next);
    startTransition(async () => {
      const result = next
        ? await blockUserAction(userId)
        : await unblockUserAction(userId);
      if (result.error) setIsBlocked(!next);
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      className="text-muted-foreground hover:text-foreground text-xs underline-offset-4 hover:underline"
    >
      {isBlocked ? "Desbloquear" : "Bloquear"}
    </button>
  );
}
