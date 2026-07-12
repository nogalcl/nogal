"use client";

import Link from "next/link";
import { markNotificationReadAction } from "@/lib/notifications/actions";
import type { Notification } from "@/lib/api/types";

function formatTimestamp(date: string): string {
  return new Date(date).toLocaleString("es-CL", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NotificationItem({
  notification,
}: {
  notification: Notification;
}) {
  const content = (
    <>
      <p className={notification.read ? "text-muted-foreground" : "text-foreground"}>
        {notification.message}
      </p>
      <p className="text-muted-foreground mt-1 text-xs">
        {formatTimestamp(notification.createdAt)}
      </p>
    </>
  );

  const className = `border-border flex items-start gap-3 border-b py-5 text-sm ${
    notification.read ? "" : "bg-muted/40"
  }`;

  if (!notification.link) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Link
      href={notification.link}
      onClick={() => {
        if (!notification.read) {
          void markNotificationReadAction(notification.id);
        }
      }}
      className={`${className} hover:bg-muted transition-colors`}
    >
      {content}
    </Link>
  );
}
