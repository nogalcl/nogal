import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/container";
import { Avatar } from "@/components/common/avatar";
import { NotificationPermissionButton } from "@/components/messaging/notification-permission-button";
import { fetchMyConversations } from "@/lib/api/messaging";
import { getAccessToken } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Mensajes" };

function formatRelativeTime(date: string): string {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMinutes = Math.round(diffMs / 60_000);
  if (diffMinutes < 1) return "ahora";
  if (diffMinutes < 60) return `hace ${diffMinutes} min`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `hace ${diffHours} h`;
  const diffDays = Math.round(diffHours / 24);
  return `hace ${diffDays} d`;
}

export default async function ConversationsPage() {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    redirect("/iniciar-sesion?next=/mensajes");
  }

  const conversations = await fetchMyConversations(accessToken);

  return (
    <Container className="py-16">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-muted-foreground text-sm uppercase tracking-widest">
            Comunidad
          </p>
          <h1 className="text-foreground mt-3 font-serif text-4xl">
            Mensajes
          </h1>
        </div>
        <NotificationPermissionButton />
      </div>

      {conversations.length === 0 ? (
        <div className="border-border bg-card mt-12 border px-8 py-20 text-center">
          <p className="text-foreground font-serif text-2xl">
            Todavía no tienes conversaciones
          </p>
          <p className="text-muted-foreground mt-3 text-sm">
            Cuando contactes a un vendedor, aparecerá aquí.
          </p>
        </div>
      ) : (
        <div className="border-border mt-12 flex flex-col divide-y border-t">
          {conversations.map((conversation) => {
            const name = `${conversation.counterpart.firstName} ${conversation.counterpart.lastName}`;
            return (
              <Link
                key={conversation.id}
                href={`/mensajes/${conversation.id}`}
                className="hover:bg-muted flex items-center gap-4 py-6 transition-colors"
              >
                <Avatar
                  name={name}
                  imageUrl={conversation.counterpart.avatarUrl}
                  className="size-12"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p
                      className={cn(
                        "text-foreground truncate font-serif text-lg",
                        conversation.unreadCount > 0 && "font-medium",
                      )}
                    >
                      {name}
                    </p>
                    <p className="text-muted-foreground shrink-0 text-xs">
                      {formatRelativeTime(conversation.updatedAt)}
                    </p>
                  </div>
                  <p className="text-muted-foreground mt-1 truncate text-sm">
                    {conversation.furniture.title}
                  </p>
                  {conversation.lastMessagePreview ? (
                    <p
                      className={cn(
                        "mt-1 truncate text-sm",
                        conversation.unreadCount > 0
                          ? "text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {conversation.lastMessagePreview}
                    </p>
                  ) : null}
                </div>
                {conversation.furniture.primaryImage ? (
                  <div className="bg-muted relative size-14 shrink-0 overflow-hidden">
                    <Image
                      src={conversation.furniture.primaryImage.url}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                ) : null}
                {conversation.unreadCount > 0 ? (
                  <span className="bg-foreground text-background flex size-5 shrink-0 items-center justify-center rounded-full text-xs">
                    {conversation.unreadCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      )}
    </Container>
  );
}
