"use server";

import { redirect } from "next/navigation";
import {
  loginUser,
  registerUser,
  requestPasswordReset as requestPasswordResetMutation,
  resetPassword as resetPasswordMutation,
  logoutUser,
} from "@/lib/api/auth";
import { extractErrorMessage } from "@/lib/api/client";
import { clearSession, getRefreshToken, setSession } from "@/lib/auth/session";

export interface AuthActionState {
  error?: string;
  success?: boolean;
}

export async function registerAction(
  _prevState: AuthActionState | null,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();

  if (password !== confirmPassword) {
    return { error: "Las contraseñas no coinciden." };
  }

  let payload;
  try {
    payload = await registerUser({
      email,
      password,
      firstName,
      lastName,
      username,
    });
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }

  await setSession(payload);
  redirect("/cuenta");
}

export async function loginAction(
  _prevState: AuthActionState | null,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  let payload;
  try {
    payload = await loginUser({ email, password });
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }

  await setSession(payload);
  redirect(safeRedirectTarget(formData.get("next")));
}

export async function logoutAction(): Promise<void> {
  const refreshToken = await getRefreshToken();
  if (refreshToken) {
    await logoutUser(refreshToken).catch(() => undefined);
  }
  await clearSession();
  redirect("/");
}

export async function requestPasswordResetAction(
  _prevState: AuthActionState | null,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();

  try {
    await requestPasswordResetMutation(email);
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }

  // La API siempre responde con éxito exista o no la cuenta (ver
  // BUSINESS_RULES/ARCHITECTURE — se evita enumeración de correos).
  return { success: true };
}

export async function resetPasswordAction(
  _prevState: AuthActionState | null,
  formData: FormData,
): Promise<AuthActionState> {
  const token = String(formData.get("token") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (newPassword !== confirmPassword) {
    return { error: "Las contraseñas no coinciden." };
  }

  try {
    await resetPasswordMutation(token, newPassword);
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }

  return { success: true };
}

/** Solo permite rutas internas relativas, para evitar open redirects vía ?next=. */
function safeRedirectTarget(value: FormDataEntryValue | null): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//")
  ) {
    return "/cuenta";
  }
  return value;
}
