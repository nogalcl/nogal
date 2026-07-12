"use server";

import { revalidatePath } from "next/cache";
import { extractErrorMessage } from "@/lib/api/client";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/api/notifications";
import { requireAccessToken } from "@/lib/auth/session";
import type { ActionResult } from "@/lib/api/action-result";

export async function markNotificationReadAction(
  id: string,
): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    await markNotificationRead(token, id);
    revalidatePath("/notificaciones");
    return { success: true };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}

export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    await markAllNotificationsRead(token);
    revalidatePath("/notificaciones");
    return { success: true };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}
