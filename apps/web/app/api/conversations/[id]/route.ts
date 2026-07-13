import { NextResponse } from "next/server";
import { fetchConversation } from "@/lib/api/messaging";
import { getAccessToken } from "@/lib/auth/session";

/**
 * Puente para que ConversationThread (cliente) pueda sondear la
 * conversación cada pocos segundos — fetchConversation es "server-only" y
 * ya marca los mensajes como leídos al consultarla, así que cada poll aquí
 * cumple ese mismo rol mientras el usuario tiene el hilo abierto.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const conversation = await fetchConversation(accessToken, id);
    return NextResponse.json(conversation);
  } catch {
    return NextResponse.json(
      { error: "No se pudo cargar la conversación." },
      { status: 500 },
    );
  }
}
