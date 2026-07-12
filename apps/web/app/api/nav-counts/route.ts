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
      unreadCount
    }
  }
`;

/**
 * Ruta dedicada (en vez de leer cookies en el layout raíz) para no forzar
 * renderizado dinámico de toda la app — ver comentario en SiteHeader. El
 * header hace un fetch cliente a esto tras la hidratación.
 */
export async function GET() {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ unreadNotifications: 0, unreadMessages: 0 });
  }

  try {
    const client = createApiClient(accessToken);
    const data = await client.request<{
      myNotifications: { unreadCount: number };
      myConversations: Array<{ unreadCount: number }>;
    }>(NAV_COUNTS_QUERY);

    return NextResponse.json({
      unreadNotifications: data.myNotifications.unreadCount,
      unreadMessages: data.myConversations.reduce(
        (sum, c) => sum + c.unreadCount,
        0,
      ),
    });
  } catch {
    return NextResponse.json({ unreadNotifications: 0, unreadMessages: 0 });
  }
}
