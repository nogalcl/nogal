"use server";

import { revalidatePath } from "next/cache";
import { apiBaseUrl } from "@/lib/env";
import { requireAccessToken } from "@/lib/auth/session";
import type { ActionResult } from "@/lib/api/action-result";

export async function uploadAvatarAction(
  formData: FormData,
): Promise<ActionResult & { avatarUrl?: string | null }> {
  try {
    const token = await requireAccessToken();
    const response = await fetch(`${apiBaseUrl}/profile/avatar`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      return { error: body?.message ?? "No se pudo subir la foto." };
    }

    const { avatarUrl } = await response.json();
    revalidatePath("/cuenta");
    return { success: true, avatarUrl };
  } catch {
    return { error: "No se pudo subir la foto." };
  }
}

export async function removeAvatarAction(): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    const response = await fetch(`${apiBaseUrl}/profile/avatar`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      return { error: "No se pudo quitar la foto." };
    }

    revalidatePath("/cuenta");
    return { success: true };
  } catch {
    return { error: "No se pudo quitar la foto." };
  }
}
