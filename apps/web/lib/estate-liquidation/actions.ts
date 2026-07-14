"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { extractErrorMessage } from "@/lib/api/client";
import { apiBaseUrl } from "@/lib/env";
import type { EstateLiquidationPieceImage } from "@/lib/api/types";
import {
  addEstateLiquidationComment,
  addEstateLiquidationPiece,
  assignEstateLiquidationExpert,
  cancelEstateLiquidationRequest,
  classifyEstateLiquidationPiece,
  completeEstateLiquidationReview,
  deleteEstateLiquidationPieceImage,
  removeEstateLiquidationPiece,
  setEstateLiquidationRequestStatus,
  simulateEstateLiquidationPayment,
  startEstateLiquidationRequest,
  updateEstateLiquidationPiece,
  updateEstateLiquidationRequest,
  type ClassifyPieceInput,
  type EstateLiquidationPieceInput,
  type UpdateEstateLiquidationRequestInput,
} from "@/lib/api/estate-liquidation";
import { getAccessToken, requireAccessToken } from "@/lib/auth/session";
import type { ActionResult } from "@/lib/api/action-result";

/** Usado desde la landing: crea el borrador y salta directo al paso 1. */
export async function startEstateLiquidationRequestAndRedirectAction(): Promise<void> {
  const token = await getAccessToken();
  if (!token) {
    redirect("/iniciar-sesion?next=/liquidacion-patrimonio");
  }
  const created = await startEstateLiquidationRequest(token);
  redirect(`/liquidacion-patrimonio/${created.id}?paso=1`);
}

/** Paso 1 — contacto y visita, avanza al paso 2. */
export async function saveContactInfoAction(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  const contactName = String(formData.get("contactName") ?? "").trim();
  const contactPhone = String(formData.get("contactPhone") ?? "").trim();
  const addressLine = String(formData.get("addressLine") ?? "").trim();
  const addressCity = String(formData.get("addressCity") ?? "").trim();
  const addressRegion = String(formData.get("addressRegion") ?? "").trim();
  const visitNotes = String(formData.get("visitNotes") ?? "").trim();

  if (!contactName) {
    return { error: "Indica un nombre de contacto." };
  }
  if (!contactPhone) {
    return { error: "Indica un teléfono de contacto." };
  }
  if (!addressLine) {
    return { error: "Indica la dirección de la visita." };
  }

  try {
    const token = await requireAccessToken();
    await updateEstateLiquidationRequest(token, {
      id,
      contactName,
      contactPhone,
      addressLine,
      addressCity: addressCity || undefined,
      addressRegion: addressRegion || undefined,
      visitNotes: visitNotes || undefined,
    });
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
  redirect(`/liquidacion-patrimonio/${id}?paso=2`);
}

export async function updateEstateLiquidationRequestAction(
  input: UpdateEstateLiquidationRequestInput,
): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    await updateEstateLiquidationRequest(token, input);
    revalidatePath(`/liquidacion-patrimonio/${input.id}`);
    return { success: true };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}

export async function addEstateLiquidationPieceAction(
  input: EstateLiquidationPieceInput,
): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    await addEstateLiquidationPiece(token, input);
    revalidatePath(`/liquidacion-patrimonio/${input.requestId}`);
    return { success: true };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}

export async function updateEstateLiquidationPieceAction(
  requestId: string,
  input: { id: string; title?: string; description?: string; categoryId?: string },
): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    await updateEstateLiquidationPiece(token, input);
    revalidatePath(`/liquidacion-patrimonio/${requestId}`);
    return { success: true };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}

export async function removeEstateLiquidationPieceAction(
  requestId: string,
  pieceId: string,
): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    await removeEstateLiquidationPiece(token, pieceId);
    revalidatePath(`/liquidacion-patrimonio/${requestId}`);
    return { success: true };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}

export async function uploadEstateLiquidationPieceImageAction(
  pieceId: string,
  requestId: string,
  formData: FormData,
): Promise<ActionResult & { image?: EstateLiquidationPieceImage }> {
  try {
    const token = await requireAccessToken();
    const response = await fetch(
      `${apiBaseUrl}/estate-liquidation-pieces/${pieceId}/images`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      },
    );

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      return { error: body?.message ?? "No se pudo subir la fotografía." };
    }

    const image: EstateLiquidationPieceImage = await response.json();
    revalidatePath(`/liquidacion-patrimonio/${requestId}`);
    return { success: true, image };
  } catch {
    return { error: "No se pudo subir la fotografía." };
  }
}

export async function deleteEstateLiquidationPieceImageAction(
  id: string,
  requestId: string,
): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    await deleteEstateLiquidationPieceImage(token, id);
    revalidatePath(`/liquidacion-patrimonio/${requestId}`);
    return { success: true };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}

/** Último paso del wizard — pago simulado. Sin pasarela real: solo confirma y envía. */
export async function confirmEstateLiquidationPaymentAction(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  try {
    const token = await requireAccessToken();
    await simulateEstateLiquidationPayment(token, id);
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
  revalidatePath("/liquidacion-patrimonio/solicitudes");
  redirect(`/liquidacion-patrimonio/solicitudes/${id}`);
}

export async function cancelEstateLiquidationRequestAction(
  id: string,
): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    await cancelEstateLiquidationRequest(token, id);
    revalidatePath(`/liquidacion-patrimonio/solicitudes/${id}`);
    revalidatePath("/liquidacion-patrimonio/solicitudes");
    revalidatePath("/liquidacion-patrimonio/panel");
    return { success: true };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}

export async function assignEstateLiquidationExpertAction(
  requestId: string,
  expertId: string,
): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    await assignEstateLiquidationExpert(token, requestId, expertId);
    revalidatePath(`/liquidacion-patrimonio/panel/${requestId}`);
    revalidatePath("/liquidacion-patrimonio/panel");
    return { success: true };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}

export async function setEstateLiquidationRequestStatusAction(
  requestId: string,
  status: string,
): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    await setEstateLiquidationRequestStatus(
      token,
      requestId,
      status as Parameters<typeof setEstateLiquidationRequestStatus>[2],
    );
    revalidatePath(`/liquidacion-patrimonio/panel/${requestId}`);
    revalidatePath("/liquidacion-patrimonio/panel");
    return { success: true };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}

export async function addEstateLiquidationCommentAction(
  requestId: string,
  body: string,
): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    await addEstateLiquidationComment(token, requestId, body);
    revalidatePath(`/liquidacion-patrimonio/panel/${requestId}`);
    return { success: true };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}

export async function classifyEstateLiquidationPieceAction(
  requestId: string,
  input: ClassifyPieceInput,
): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    await classifyEstateLiquidationPiece(token, input);
    revalidatePath(`/liquidacion-patrimonio/panel/${requestId}`);
    return { success: true };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}

export async function completeEstateLiquidationReviewAction(
  requestId: string,
): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    await completeEstateLiquidationReview(token, requestId);
    revalidatePath(`/liquidacion-patrimonio/panel/${requestId}`);
    revalidatePath("/liquidacion-patrimonio/panel");
    return { success: true };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}
