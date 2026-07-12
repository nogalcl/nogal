"use server";

import { revalidatePath } from "next/cache";
import { extractErrorMessage } from "@/lib/api/client";
import { sendMessage, startConversation } from "@/lib/api/messaging";
import { requireAccessToken } from "@/lib/auth/session";
import type { ActionResult } from "@/lib/api/action-result";

export async function startConversationAction(
  furnitureId: string,
): Promise<ActionResult & { conversationId?: string }> {
  try {
    const token = await requireAccessToken();
    const conversationId = await startConversation(token, furnitureId);
    return { success: true, conversationId };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}

export async function sendMessageAction(
  conversationId: string,
  body: string,
): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    await sendMessage(token, conversationId, body);
    revalidatePath(`/mensajes/${conversationId}`);
    revalidatePath("/mensajes");
    return { success: true };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}
