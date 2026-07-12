"use server";

import { revalidatePath } from "next/cache";
import { extractErrorMessage } from "@/lib/api/client";
import {
  addToCollection,
  createCollection,
  deleteCollection,
  removeFromCollection,
} from "@/lib/api/collections";
import { requireAccessToken } from "@/lib/auth/session";
import type { ActionResult } from "@/lib/api/action-result";

export async function createCollectionAction(
  name: string,
  description?: string,
): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    await createCollection(token, { name, description });
    revalidatePath("/colecciones");
    return { success: true };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}

export async function deleteCollectionAction(id: string): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    await deleteCollection(token, id);
    revalidatePath("/colecciones");
    return { success: true };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}

export async function addToCollectionAction(
  id: string,
  furnitureId: string,
): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    await addToCollection(token, id, furnitureId);
    revalidatePath("/colecciones");
    return { success: true };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}

export async function removeFromCollectionAction(
  id: string,
  furnitureId: string,
): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    await removeFromCollection(token, id, furnitureId);
    revalidatePath("/colecciones");
    return { success: true };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}
