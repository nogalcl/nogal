"use server";

import { revalidatePath } from "next/cache";
import { extractErrorMessage } from "@/lib/api/client";
import {
  approveFurniture,
  createRestorer,
  rejectFurniture,
  resolveReport,
  restoreUser,
  setRestorerActive,
  setUserRole,
  suspendUser,
  unverifyStore,
  updateRestorer,
  verifyStore,
  type CreateRestorerInput,
  type UpdateRestorerInput,
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

export async function createRestorerAction(
  input: CreateRestorerInput,
): Promise<ActionResult & { id?: string }> {
  try {
    const token = await requireAccessToken();
    const created = await createRestorer(token, input);
    revalidatePath("/admin/restauradores");
    return { success: true, id: created.id };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}

export async function updateRestorerAction(
  input: UpdateRestorerInput,
): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    await updateRestorer(token, input);
    revalidatePath("/admin/restauradores");
    return { success: true };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}

export async function setRestorerActiveAction(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    await setRestorerActive(token, id, isActive);
    revalidatePath("/admin/restauradores");
    return { success: true };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}
