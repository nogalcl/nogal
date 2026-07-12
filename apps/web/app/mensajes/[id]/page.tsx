import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/container";
import { Avatar } from "@/components/common/avatar";
import { MessageForm } from "@/components/messaging/message-form";
import { BlockButton } from "@/components/social/block-button";
import { ReportButton } from "@/components/reports/report-button";
import { fetchConversation } from "@/lib/api/messaging";
import { getAccessToken } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Conversación" };

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatTimestamp(date: string): string {
  return new Date(date).toLocaleString("es-CL", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function ConversationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const accessToken = await getAccessToken();
  if (!accessToken) {
    redirect(`/iniciar-sesion?next=/mensajes/${id}`);
  }

  const conversation = await fetchConversation(accessToken, id);
  const name = `${conversation.counterpart.firstName} ${conversation.counterpart.lastName}`;

  return (
    <Container className="py-16">
      <Link
        href="/mensajes"
        className="text-muted-foreground hover:text-foreground text-sm"
      >
        ← Mensajes
      </Link>

      <div className="border-border mt-6 flex items-center justify-between gap-4 border-b pb-6">
        <div className="flex items-center gap-4">
          <Avatar
            name={name}
            imageUrl={conversation.counterpart.avatarUrl}
            className="size-12"
          />
          <div>
            <Link
              href={`/perfil/${conversation.counterpart.username}`}
              className="text-foreground text-base hover:underline"
            >
              {name}
            </Link>
            <Link
              href={`/piezas/${conversation.furniture.slug}`}
              className="text-muted-foreground mt-1 block text-sm hover:underline"
            >
              Sobre: {conversation.furniture.title}
            </Link>
          </div>
        </div>
        {conversation.furniture.primaryImage ? (
          <div className="bg-muted relative hidden size-16 shrink-0 overflow-hidden sm:block">
            <Image
              src={conversation.furniture.primaryImage.url}
              alt=""
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
        ) : null}
      </div>

      <div className="mt-10 flex flex-col gap-8">
        {conversation.messages.map((message) => (
          <div
            key={message.id}
            className={message.isMine ? "text-right" : "text-left"}
          >
            <p className="text-muted-foreground text-xs">
              {message.isMine ? "Tú" : name} · {formatTimestamp(message.createdAt)}
              {message.isMine ? (message.read ? " · Leído" : " · Enviado") : ""}
            </p>
            <p className="text-foreground mt-2 inline-block max-w-lg text-left text-base leading-relaxed">
              {message.body}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <MessageForm conversationId={conversation.id} />
      </div>

      <div className="border-border mt-16 flex items-center gap-6 border-t pt-6">
        <BlockButton userId={conversation.counterpart.id} />
        <ReportButton
          targetType="CONVERSATION"
          targetId={conversation.id}
          label="Reportar conversación"
        />
      </div>
    </Container>
  );
}
