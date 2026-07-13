"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  useNavCounts,
  type ConversationSummary,
} from "@/lib/hooks/use-nav-counts";

interface ToastState {
  id: string;
  counterpartName: string;
  preview: string | null;
}

const TOAST_DURATION_MS = 8_000;

/**
 * Nogal no tiene WebSockets/GraphQL subscriptions — el aviso de "mensaje
 * nuevo" se arma sobre el mismo polling de useNavCounts (cada 20s) que ya
 * alimenta los badges del header, comparando el unreadCount de cada
 * conversación contra el ciclo anterior. No es instantáneo como un socket,
 * pero cumple "avísame si me llega un mensaje mientras estoy en línea" sin
 * levantar infraestructura de tiempo real nueva.
 *
 * Mientras la pestaña está visible se muestra un aviso propio en pantalla;
 * si está en segundo plano (otra pestaña/app) y el usuario ya dio permiso,
 * se dispara además una notificación nativa del navegador.
 */
export function MessageNotifier() {
  const { conversations } = useNavCounts();
  const pathname = usePathname();
  const router = useRouter();
  const previousUnread = useRef<Map<string, number> | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const notify = useCallback(
    (conversation: ConversationSummary) => {
      if (
        typeof document !== "undefined" &&
        document.visibilityState !== "visible" &&
        typeof Notification !== "undefined" &&
        Notification.permission === "granted"
      ) {
        const native = new Notification(
          `Nuevo mensaje de ${conversation.counterpartName}`,
          {
            body: conversation.lastMessagePreview ?? undefined,
            tag: conversation.id,
          },
        );
        native.onclick = () => {
          window.focus();
          router.push(`/mensajes/${conversation.id}`);
        };
      }

      setToast({
        id: conversation.id,
        counterpartName: conversation.counterpartName,
        preview: conversation.lastMessagePreview,
      });
    },
    [router],
  );

  useEffect(() => {
    const previous = previousUnread.current;

    // Primer poll tras montar: solo registra la base, no avisa de nada que
    // ya existía antes de que el usuario entrara al sitio.
    if (previous === null) {
      previousUnread.current = new Map(
        conversations.map((c) => [c.id, c.unreadCount]),
      );
      return;
    }

    for (const conversation of conversations) {
      const before = previous.get(conversation.id) ?? 0;
      const isViewingThisThread = pathname === `/mensajes/${conversation.id}`;
      if (conversation.unreadCount > before && !isViewingThisThread) {
        notify(conversation);
      }
      previous.set(conversation.id, conversation.unreadCount);
    }
  }, [conversations, pathname, notify]);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), TOAST_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [toast]);

  if (!toast) return null;

  return (
    <button
      type="button"
      onClick={() => {
        router.push(`/mensajes/${toast.id}`);
        setToast(null);
      }}
      className="border-border bg-card fixed bottom-6 right-6 z-50 flex w-full max-w-sm flex-col gap-1 border px-5 py-4 text-left shadow-lg"
    >
      <p className="text-muted-foreground text-xs uppercase tracking-widest">
        Nuevo mensaje
      </p>
      <p className="text-foreground font-serif text-lg">
        {toast.counterpartName}
      </p>
      {toast.preview ? (
        <p className="text-muted-foreground line-clamp-2 text-sm">
          {toast.preview}
        </p>
      ) : null}
    </button>
  );
}
