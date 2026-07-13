"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendMessageAction } from "@/lib/messaging/actions";

export function MessageForm({
  conversationId,
  onSent,
}: {
  conversationId: string;
  onSent?: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    const body = String(formData.get("body") ?? "").trim();
    if (!body) return;
    setError(null);
    startTransition(async () => {
      const result = await sendMessageAction(conversationId, body);
      if (result.error) {
        setError(result.error);
      } else {
        formRef.current?.reset();
        onSent?.();
      }
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-col gap-3">
      <Textarea
        name="body"
        placeholder="Escribe un mensaje…"
        rows={3}
        required
        maxLength={2000}
      />
      <div className="flex items-center justify-between">
        {error ? <p className="text-destructive text-sm">{error}</p> : <span />}
        <Button type="submit" disabled={isPending}>
          Enviar
        </Button>
      </div>
    </form>
  );
}
