"use server";

import { revalidatePath } from "next/cache";
import { extractErrorMessage } from "@/lib/api/client";
import { addFavorite, removeFavorite } from "@/lib/api/favorites";
import { requireAccessToken } from "@/lib/auth/session";
import type { ActionResult } from "@/lib/api/action-result";

export async function addFavoriteAction(
  furnitureId: string,
): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    await addFavorite(token, furnitureId);
    revalidatePath("/favoritos");
    return { success: true };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}

export async function removeFavoriteAction(
  furnitureId: string,
): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    await removeFavorite(token, furnitureId);
    revalidatePath("/favoritos");
    return { success: true };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}
