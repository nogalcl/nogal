"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { extractErrorMessage } from "@/lib/api/client";
import { apiBaseUrl } from "@/lib/env";
import type { ValuationRequestImage } from "@/lib/api/types";
import {
  addValuationComment,
  assignValuationExpert,
  cancelValuationRequest,
  createValuationReport,
  deleteValuationRequestImage,
  setValuationRequestStatus,
  simulateValuationPayment,
  startValuationRequest,
  updateValuationReport,
  updateValuationRequest,
  type UpdateValuationRequestInput,
  type ValuationReportInput,
} from "@/lib/api/valuation";
import { getAccessToken, requireAccessToken } from "@/lib/auth/session";
import type { ActionResult } from "@/lib/api/action-result";

export async function startValuationRequestAction(): Promise<
  ActionResult & { id?: string }
> {
  try {
    const token = await requireAccessToken();
    const created = await startValuationRequest(token);
    return { success: true, id: created.id };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}

/** Usado desde la landing: crea el borrador y salta directo al paso 1. */
export async function startValuationRequestAndRedirectAction(): Promise<void> {
  const token = await getAccessToken();
  if (!token) {
    redirect("/iniciar-sesion?next=/valoracion-express");
  }
  const created = await startValuationRequest(token);
  redirect(`/valoracion-express/${created.id}?paso=1`);
}

/** Paso 2 — valida, guarda y avanza al paso 3. */
export async function saveValuationInfoAction(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const estimatedDecadeRaw = String(formData.get("estimatedDecade") ?? "").trim();
  const locationCity = String(formData.get("locationCity") ?? "").trim();

  if (title.length < 3) {
    return { error: "Cuéntanos al menos el nombre de la pieza (mínimo 3 caracteres)." };
  }
  if (description.length < 10) {
    return { error: "Agrega una descripción un poco más detallada (mínimo 10 caracteres)." };
  }

  try {
    const token = await requireAccessToken();
    await updateValuationRequest(token, {
      id,
      title,
      description,
      categoryId: categoryId || undefined,
      estimatedDecade: estimatedDecadeRaw ? Number(estimatedDecadeRaw) : undefined,
      locationCity: locationCity || undefined,
    });
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
  redirect(`/valoracion-express/${id}?paso=3`);
}

/** Paso 3 — objetivo, avanza al paso 4. */
export async function saveValuationObjectiveAction(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  const objective = String(formData.get("objective") ?? "");
  if (!objective) {
    return { error: "Elige un objetivo para continuar." };
  }

  try {
    const token = await requireAccessToken();
    await updateValuationRequest(token, { id, objective });
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
  redirect(`/valoracion-express/${id}?paso=4`);
}

/** Paso 5 — pago simulado. Sin pasarela real: solo confirma y envía. */
export async function confirmValuationPaymentAction(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  try {
    const token = await requireAccessToken();
    await simulateValuationPayment(token, id);
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
  revalidatePath("/valoracion-express/solicitudes");
  redirect(`/valoracion-express/solicitudes/${id}`);
}

export async function updateValuationRequestAction(
  input: UpdateValuationRequestInput,
): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    await updateValuationRequest(token, input);
    revalidatePath(`/valoracion-express/solicitudes/${input.id}`);
    return { success: true };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}

export async function simulateValuationPaymentAction(
  id: string,
): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    await simulateValuationPayment(token, id);
    revalidatePath(`/valoracion-express/solicitudes/${id}`);
    revalidatePath("/valoracion-express/solicitudes");
    return { success: true };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}

export async function cancelValuationRequestAction(
  id: string,
): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    await cancelValuationRequest(token, id);
    revalidatePath(`/valoracion-express/solicitudes/${id}`);
    revalidatePath("/valoracion-express/solicitudes");
    revalidatePath("/valoracion-express/panel");
    return { success: true };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}

export async function uploadValuationImageAction(
  requestId: string,
  formData: FormData,
): Promise<ActionResult & { image?: ValuationRequestImage }> {
  try {
    const token = await requireAccessToken();
    const response = await fetch(
      `${apiBaseUrl}/valuation-requests/${requestId}/images`,
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

    const image: ValuationRequestImage = await response.json();
    revalidatePath(`/valoracion-express/solicitudes/${requestId}`);
    return { success: true, image };
  } catch {
    return { error: "No se pudo subir la fotografía." };
  }
}

export async function deleteValuationRequestImageAction(
  id: string,
  requestId: string,
): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    await deleteValuationRequestImage(token, id);
    revalidatePath(`/valoracion-express/solicitudes/${requestId}`);
    return { success: true };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}

export async function assignValuationExpertAction(
  requestId: string,
  expertId: string,
): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    await assignValuationExpert(token, requestId, expertId);
    revalidatePath(`/valoracion-express/panel/${requestId}`);
    revalidatePath("/valoracion-express/panel");
    return { success: true };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}

export async function setValuationRequestStatusAction(
  requestId: string,
  status: string,
): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    await setValuationRequestStatus(
      token,
      requestId,
      status as Parameters<typeof setValuationRequestStatus>[2],
    );
    revalidatePath(`/valoracion-express/panel/${requestId}`);
    revalidatePath("/valoracion-express/panel");
    return { success: true };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}

export async function addValuationCommentAction(
  requestId: string,
  body: string,
): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    await addValuationComment(token, requestId, body);
    revalidatePath(`/valoracion-express/panel/${requestId}`);
    return { success: true };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}

export async function createValuationReportAction(
  input: ValuationReportInput,
): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    await createValuationReport(token, input);
    revalidatePath(`/valoracion-express/panel/${input.requestId}`);
    revalidatePath(`/valoracion-express/solicitudes/${input.requestId}`);
    return { success: true };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}

export async function updateValuationReportAction(
  input: ValuationReportInput,
): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    await updateValuationReport(token, input);
    revalidatePath(`/valoracion-express/panel/${input.requestId}`);
    revalidatePath(`/valoracion-express/solicitudes/${input.requestId}`);
    return { success: true };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}

function numberOrUndefined(value: FormDataEntryValue | null): number | undefined {
  const str = String(value ?? "").trim();
  return str ? Number(str) : undefined;
}

function stringOrUndefined(value: FormDataEntryValue | null): string | undefined {
  const str = String(value ?? "").trim();
  return str || undefined;
}

/** Formulario del informe (panel experto) — crea o actualiza según
 * `hasReport`, con la misma firma de acción de useActionState. */
export async function saveValuationReportAction(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const requestId = String(formData.get("requestId") ?? "");
  const hasReport = formData.get("hasReport") === "true";
  const summary = String(formData.get("summary") ?? "").trim();
  const estimatedValueMin = numberOrUndefined(formData.get("estimatedValueMin"));
  const estimatedValueMax = numberOrUndefined(formData.get("estimatedValueMax"));

  if (summary.length < 10) {
    return { error: "El resumen debe tener al menos 10 caracteres." };
  }
  if (!estimatedValueMin || !estimatedValueMax) {
    return { error: "Ingresa el rango de valor estimado." };
  }
  if (estimatedValueMin > estimatedValueMax) {
    return { error: "El valor mínimo no puede ser mayor que el máximo." };
  }

  const input: ValuationReportInput = {
    requestId,
    summary,
    probableIdentification: stringOrUndefined(formData.get("probableIdentification")),
    materialIds: formData.getAll("materialIds").map(String),
    woodTypeIds: formData.getAll("woodTypeIds").map(String),
    styleId: stringOrUndefined(formData.get("styleId")),
    decade: numberOrUndefined(formData.get("decade")),
    designerId: stringOrUndefined(formData.get("designerId")),
    manufacturerId: stringOrUndefined(formData.get("manufacturerId")),
    condition: stringOrUndefined(formData.get("condition")),
    observations: stringOrUndefined(formData.get("observations")),
    warnings: stringOrUndefined(formData.get("warnings")),
    estimatedValueMin,
    estimatedValueMax,
    quickSaleValue: numberOrUndefined(formData.get("quickSaleValue")),
    idealSaleValue: numberOrUndefined(formData.get("idealSaleValue")),
    estimatedSaleTime: stringOrUndefined(formData.get("estimatedSaleTime")),
    tips: stringOrUndefined(formData.get("tips")),
    confidenceLevel: numberOrUndefined(formData.get("confidenceLevel")),
  };

  try {
    const token = await requireAccessToken();
    if (hasReport) {
      await updateValuationReport(token, input);
    } else {
      await createValuationReport(token, input);
    }
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }

  revalidatePath(`/valoracion-express/panel/${requestId}`);
  revalidatePath(`/valoracion-express/solicitudes/${requestId}`);
  redirect(`/valoracion-express/panel/${requestId}`);
}
