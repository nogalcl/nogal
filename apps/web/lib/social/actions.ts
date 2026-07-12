"use server";

import { revalidatePath } from "next/cache";
import { extractErrorMessage } from "@/lib/api/client";
import { blockUser, followUser, unblockUser, unfollowUser } from "@/lib/api/social";
import { requireAccessToken } from "@/lib/auth/session";
import type { ActionResult } from "@/lib/api/action-result";

export async function followUserAction(
  userId: string,
  profilePath: string,
): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    await followUser(token, userId);
    revalidatePath(profilePath);
    return { success: true };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}

export async function unfollowUserAction(
  userId: string,
  profilePath: string,
): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    await unfollowUser(token, userId);
    revalidatePath(profilePath);
    return { success: true };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}

export async function blockUserAction(userId: string): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    await blockUser(token, userId);
    revalidatePath("/mensajes");
    return { success: true };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}

export async function unblockUserAction(userId: string): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    await unblockUser(token, userId);
    revalidatePath("/mensajes");
    return { success: true };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}
