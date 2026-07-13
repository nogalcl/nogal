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

export function useNavCounts(): NavCounts {
  const [counts, setCounts] = useState<NavCounts>(EMPTY);

  useEffect(() => {
    let cancelled = false;

    async function load() {
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
