"use server";

import { revalidatePath } from "next/cache";
import { extractErrorMessage } from "@/lib/api/client";
import {
  approveFurniture,
  rejectFurniture,
  resolveReport,
  restoreUser,
  setUserRole,
  suspendUser,
  unverifyStore,
  verifyStore,
} from "@/lib/api/admin";
import { requireAccessToken } from "@/lib/auth/session";
import type { ActionResult } from "@/lib/api/action-result";

export async function approveFurnitureAction(id: string): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    await approveFurniture(token, id);
    revalidatePath("/admin/moderacion");
    return { success: true };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}

export async function rejectFurnitureAction(
  id: string,
  reason: string,
): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    await rejectFurniture(token, id, reason);
    revalidatePath("/admin/moderacion");
    return { success: true };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}

export async function verifyStoreAction(id: string): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    await verifyStore(token, id);
    revalidatePath("/admin/tiendas");
    return { success: true };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}

export async function unverifyStoreAction(id: string): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    await unverifyStore(token, id);
    revalidatePath("/admin/tiendas");
    return { success: true };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}

export async function resolveReportAction(
  id: string,
  status: "REVIEWED" | "DISMISSED" | "ACTION_TAKEN",
): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    await resolveReport(token, id, status);
    revalidatePath("/admin/reportes");
    return { success: true };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}

export async function setUserRoleAction(
  userId: string,
  role: "USER" | "MODERATOR" | "ADMIN",
): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    await setUserRole(token, userId, role);
    revalidatePath("/admin/usuarios");
    return { success: true };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}

export async function suspendUserAction(userId: string): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    await suspendUser(token, userId);
    revalidatePath("/admin/usuarios");
    return { success: true };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}

export async function restoreUserAction(userId: string): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    await restoreUser(token, userId);
    revalidatePath("/admin/usuarios");
    return { success: true };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}
