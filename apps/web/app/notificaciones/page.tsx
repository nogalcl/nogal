import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/container";
import { NotificationItem } from "@/components/notifications/notification-item";
import { MarkAllReadButton } from "@/components/notifications/mark-all-read-button";
import { fetchMyNotifications } from "@/lib/api/notifications";
import { getAccessToken } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Notificaciones" };

export default async function NotificationsPage() {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    redirect("/iniciar-sesion?next=/notificaciones");
  }

  const notifications = await fetchMyNotifications(accessToken);

  return (
    <Container className="py-16">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm uppercase tracking-widest">
            Comunidad
          </p>
          <h1 className="text-foreground mt-3 font-serif text-4xl">
            Notificaciones
          </h1>
        </div>
        {notifications.unreadCount > 0 ? <MarkAllReadButton /> : null}
      </div>

      {notifications.items.length === 0 ? (
        <div className="border-border bg-card mt-12 border px-8 py-20 text-center">
          <p className="text-foreground font-serif text-2xl">
            Sin notificaciones todavía
          </p>
          <p className="text-muted-foreground mt-3 text-sm">
            Aquí aparecerán mensajes, seguidores y novedades de tus piezas.
          </p>
        </div>
      ) : (
        <div className="border-border mt-12 border-t">
          {notifications.items.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
            />
          ))}
        </div>
      )}
    </Container>
  );
}
