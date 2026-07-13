"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageForm } from "@/components/messaging/message-form";
import type { Conversation } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const POLL_INTERVAL_MS = 5_000;

function formatTimestamp(date: string): string {
  return new Date(date).toLocaleString("es-CL", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Cliente, no server component: mientras el hilo está abierto se sondea la
 * conversación cada 5s (más seguido que el polling global de 20s del
 * header, porque aquí la inmediatez importa más) para que los mensajes
 * nuevos aparezcan solos, sin recargar la página — ver MessageNotifier
 * para el razonamiento completo de por qué polling y no WebSockets.
 */
export function ConversationThread({
  initialConversation,
  counterpartName,
}: {
  initialConversation: Conversation;
  counterpartName: string;
}) {
  const [conversation, setConversation] = useState(initialConversation);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messageCountRef = useRef(initialConversation.messages.length);
  // El poll de 5s y el reload tras enviar pueden solaparse; sin esta guarda
  // una respuesta más vieja que llega después de una más nueva pisaría el
  // estado con datos desactualizados (se vio en pruebas: un mensaje propio
  // "desaparecía" momentáneamente tras una respuesta rápida del otro lado).
  const requestIdRef = useRef(0);

  const reload = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    try {
      const response = await fetch(
        `/api/conversations/${initialConversation.id}`,
      );
      if (!response.ok) return;
      const data: Conversation = await response.json();
      if (requestId === requestIdRef.current) setConversation(data);
    } catch {
      // Silencioso — se reintenta en el próximo ciclo.
    }
  }, [initialConversation.id]);

  useEffect(() => {
    const interval = setInterval(reload, POLL_INTERVAL_MS);
    function handleVisibility() {
      if (document.visibilityState === "visible") reload();
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [reload]);

  useEffect(() => {
    if (conversation.messages.length > messageCountRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    messageCountRef.current = conversation.messages.length;
  }, [conversation.messages.length]);

  return (
    <>
      <div className="mt-10 flex flex-col gap-6">
        {conversation.messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex flex-col gap-2 px-5 py-4",
              message.isMine
                ? "border-border ml-auto max-w-lg self-end border-r-2 text-right"
                : "bg-card max-w-lg",
            )}
          >
            <p className="text-muted-foreground text-xs uppercase tracking-widest">
              {message.isMine ? "Tú" : counterpartName} ·{" "}
              {formatTimestamp(message.createdAt)}
              {message.isMine ? (message.read ? " · Leído" : " · Enviado") : ""}
            </p>
            <p className="text-foreground whitespace-pre-line text-base leading-relaxed">
              {message.body}
            </p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="mt-10">
        <MessageForm
          conversationId={conversation.id}
          onSent={reload}
        />
      </div>
    </>
  );
}
