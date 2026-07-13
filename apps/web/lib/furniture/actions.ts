"use server";

import { revalidatePath } from "next/cache";
import { extractErrorMessage } from "@/lib/api/client";
import { apiBaseUrl } from "@/lib/env";
import type { FurnitureImage } from "@/lib/api/types";
import {
  archiveFurniture,
  createFurniture,
  deleteFurniture,
  deleteFurnitureImage,
  duplicateFurniture,
  markFurnitureSold,
  publishFurniture,
  reorderFurnitureImages,
  reserveFurniture,
  restoreFurniture,
  unpublishFurniture,
  updateFurniture,
} from "@/lib/api/furniture";
import { getAccessToken } from "@/lib/auth/session";
import type { FurnitureFormValues } from "./types";

export interface ActionResult {
  success?: boolean;
  error?: string;
  id?: string;
  slug?: string;
}

function toFurnitureInput(values: FurnitureFormValues) {
  return {
    title: values.title,
    description: values.description,
    categoryId: values.categoryId || undefined,
    styleId: values.styleId || undefined,
    designerId: values.designerId || undefined,
    manufacturerId: values.manufacturerId || undefined,
    originCountryId: values.originCountryId || undefined,
    materialIds: values.materialIds,
    woodTypeIds: values.woodTypeIds,
    condition: values.condition || undefined,
    conditionNotes: values.conditionNotes || undefined,
    originality: values.originality,
    color: values.color || undefined,
    decade: values.decade || undefined,
    widthCm: values.widthCm || undefined,
    heightCm: values.heightCm || undefined,
    depthCm: values.depthCm || undefined,
    weightKg: values.weightKg || undefined,
    price: values.price || undefined,
    priceType: values.priceType,
    locationCity: values.locationCity,
    locationRegion: values.locationRegion || undefined,
  };
}

async function requireAccessToken(): Promise<string> {
  const token = await getAccessToken();
  if (!token) throw new Error("NO_SESSION");
  return token;
}

export async function createFurnitureAction(
  values: FurnitureFormValues,
): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    const created = await createFurniture(token, toFurnitureInput(values));
    revalidatePath("/vender/piezas");
    return { success: true, id: created.id, slug: created.slug };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}

export async function updateFurnitureAction(
  id: string,
  values: FurnitureFormValues,
): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    const updated = await updateFurniture(token, {
      id,
      ...toFurnitureInput(values),
    });
    revalidatePath("/vender/piezas");
    revalidatePath(`/piezas/${updated.slug}`);
    return { success: true, id: updated.id, slug: updated.slug };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}

type FurnitureIdAction = (id: string) => Promise<ActionResult>;

function wrapStatusAction(
  mutate: (token: string, id: string) => Promise<{ slug: string }>,
): FurnitureIdAction {
  return async (id: string) => {
    try {
      const token = await requireAccessToken();
      const result = await mutate(token, id);
      revalidatePath("/vender/piezas");
      revalidatePath(`/piezas/${result.slug}`);
      return { success: true, slug: result.slug };
    } catch (error) {
      return { error: extractErrorMessage(error) };
    }
  };
}

export const publishFurnitureAction = wrapStatusAction(publishFurniture);
export const unpublishFurnitureAction = wrapStatusAction(unpublishFurniture);
export const reserveFurnitureAction = wrapStatusAction(reserveFurniture);
export const markFurnitureSoldAction = wrapStatusAction(markFurnitureSold);
export const archiveFurnitureAction = wrapStatusAction(archiveFurniture);
export const restoreFurnitureAction = wrapStatusAction(restoreFurniture);

export async function duplicateFurnitureAction(
  id: string,
): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    const duplicated = await duplicateFurniture(token, id);
    revalidatePath("/vender/piezas");
    return { success: true, id: duplicated.id, slug: duplicated.slug };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}

export async function deleteFurnitureAction(id: string): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    await deleteFurniture(token, id);
    revalidatePath("/vender/piezas");
    return { success: true };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}

export async function reorderFurnitureImagesAction(
  furnitureId: string,
  imageIds: string[],
): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    await reorderFurnitureImages(token, furnitureId, imageIds);
    return { success: true };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}

export async function deleteFurnitureImageAction(
  id: string,
): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    await deleteFurnitureImage(token, id);
    return { success: true };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}

export async function uploadFurnitureImageAction(
  furnitureId: string,
  formData: FormData,
): Promise<ActionResult & { image?: FurnitureImage }> {
  try {
    const token = await requireAccessToken();
    const response = await fetch(
      `${apiBaseUrl}/furniture/${furnitureId}/images`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      },
    );

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      return {
        error: body?.message ?? "No se pudo subir la imagen.",
      };
    }

    const image: FurnitureImage = await response.json();
    return { success: true, image };
  } catch {
    return { error: "No se pudo subir la imagen." };
  }
}
