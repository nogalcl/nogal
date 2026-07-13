import { NextResponse } from "next/server";
import { gql } from "graphql-request";
import { createApiClient } from "@/lib/api/client";
import { getAccessToken } from "@/lib/auth/session";

const NAV_COUNTS_QUERY = gql`
  query NavCounts {
    myNotifications(page: 1) {
      unreadCount
    }
    myConversations {
      id
      unreadCount
      lastMessagePreview
      updatedAt
      counterpart {
        firstName
        lastName
      }
    }
  }
`;

export interface ConversationSummary {
  id: string;
  unreadCount: number;
  lastMessagePreview: string | null;
  updatedAt: string;
  counterpartName: string;
}

/**
 * Ruta dedicada (en vez de leer cookies en el layout raíz) para no forzar
 * renderizado dinámico de toda la app — ver comentario en SiteHeader. El
 * header hace un fetch cliente a esto tras la hidratación, y MessageNotifier
 * lo sondea periódicamente para detectar mensajes nuevos y avisar — ver
 * comentario ahí sobre por qué es polling y no WebSockets/subscriptions.
 */
export async function GET() {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json({
      unreadNotifications: 0,
      unreadMessages: 0,
      conversations: [],
    });
  }

  try {
    const client = createApiClient(accessToken);
    const data = await client.request<{
      myNotifications: { unreadCount: number };
      myConversations: Array<{
        id: string;
        unreadCount: number;
        lastMessagePreview: string | null;
        updatedAt: string;
        counterpart: { firstName: string; lastName: string };
      }>;
    }>(NAV_COUNTS_QUERY);

    const conversations: ConversationSummary[] = data.myConversations.map(
      (c) => ({
        id: c.id,
        unreadCount: c.unreadCount,
        lastMessagePreview: c.lastMessagePreview,
        updatedAt: c.updatedAt,
        counterpartName: `${c.counterpart.firstName} ${c.counterpart.lastName}`,
      }),
    );

    return NextResponse.json({
      unreadNotifications: data.myNotifications.unreadCount,
      unreadMessages: conversations.reduce((sum, c) => sum + c.unreadCount, 0),
      conversations,
    });
  } catch {
    return NextResponse.json({
      unreadNotifications: 0,
      unreadMessages: 0,
      conversations: [],
    });
  }
}
