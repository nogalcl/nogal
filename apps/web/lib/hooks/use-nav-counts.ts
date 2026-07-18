"use client";

import { useEffect, useState } from "react";

export interface ConversationSummary {
  id: string;
  unreadCount: number;
  lastMessagePreview: string | null;
  updatedAt: string;
  counterpartName: string;
}

export interface NavCounts {
  unreadNotifications: number;
  unreadMessages: number;
  conversations: ConversationSummary[];
}

const EMPTY: NavCounts = {
  unreadNotifications: 0,
  unreadMessages: 0,
  conversations: [],
};

// 20s: suficientemente rápido para sentirse "en vivo" sin acercarse al
// tráfico de un WebSocket/subscription — ver MessageNotifier para el resto
// del razonamiento sobre por qué polling y no algo persistente.
const POLL_INTERVAL_MS = 20_000;
const SESSION_HINT_COOKIE = "nogal_session";

// La mayoría de las visitas a un marketplace público son anónimas. Sin esta
// revisión, cada una de esas pestañas igual dispara una invocación de
// función a /api/nav-counts cada 20s para no traer nada — es lo que agotó
// la cuota de invocaciones de Vercel. La cookie es un hint no-httpOnly (ver
// setSession en lib/auth/session.ts), así que esto es síncrono, sin red.
function hasSessionHint(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split("; ")
    .some((entry) => entry.startsWith(`${SESSION_HINT_COOKIE}=`));
}

export function useNavCounts(): NavCounts {
  const [counts, setCounts] = useState<NavCounts>(EMPTY);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // Se revisa en cada tick, no solo al montar: si alguien inicia sesión
      // sin recargar la página, el header (parte del layout persistente) no
      // se remonta, así que un chequeo único al montar nunca se enteraría.
      if (!hasSessionHint()) return;
      try {
        const response = await fetch("/api/nav-counts");
        const data = await response.json();
        if (!cancelled) setCounts(data);
      } catch {
        // Silencioso — se reintenta en el próximo ciclo de polling.
      }
    }

    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);

    function handleVisibility() {
      if (document.visibilityState === "visible") load();
    }
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return counts;
}
