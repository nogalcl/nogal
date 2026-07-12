"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { startConversationAction } from "@/lib/messaging/actions";

export function ContactSellerButton({
  furnitureId,
  isAuthenticated,
  redirectPath,
}: {
  furnitureId: string;
  isAuthenticated: boolean;
  redirectPath: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleClick() {
    if (!isAuthenticated) {
      router.push(`/iniciar-sesion?next=${encodeURIComponent(redirectPath)}`);
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await startConversationAction(furnitureId);
      if (result.conversationId) {
        router.push(`/mensajes/${result.conversationId}`);
      } else {
        setError(result.error ?? "No se pudo iniciar la conversación.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <Button size="lg" onClick={handleClick} disabled={isPending}>
        Contactar al vendedor
      </Button>
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
    </div>
  );
}
