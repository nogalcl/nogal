import "server-only";
import { cookies } from "next/headers";
import type { AuthPayload } from "@/lib/api/auth";

const ACCESS_TOKEN_COOKIE = "nogal_access_token";
const REFRESH_TOKEN_COOKIE = "nogal_refresh_token";
// No lleva el token, solo indica "probablemente hay sesión" — a diferencia
// de las de arriba, no es httpOnly a propósito: el cliente la lee de forma
// síncrona (sin red) para decidir si vale la pena arrancar el polling de
// useNavCounts. Ver ese hook — si esto no está, ni siquiera llama a
// /api/nav-counts.
const SESSION_HINT_COOKIE = "nogal_session";

const baseCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function setSession(payload: AuthPayload): Promise<void> {
  const store = await cookies();

  store.set(ACCESS_TOKEN_COOKIE, payload.accessToken, {
    ...baseCookieOptions,
    maxAge: payload.accessTokenExpiresInSeconds,
  });

  store.set(REFRESH_TOKEN_COOKIE, payload.refreshToken, {
    ...baseCookieOptions,
    expires: new Date(payload.refreshTokenExpiresAt),
  });

  store.set(SESSION_HINT_COOKIE, "1", {
    ...baseCookieOptions,
    httpOnly: false,
    expires: new Date(payload.refreshTokenExpiresAt),
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(ACCESS_TOKEN_COOKIE);
  store.delete(REFRESH_TOKEN_COOKIE);
  store.delete(SESSION_HINT_COOKIE);
}

export async function getAccessToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(ACCESS_TOKEN_COOKIE)?.value;
}

/** Para Server Actions que requieren sesión — lanza si no hay token. */
export async function requireAccessToken(): Promise<string> {
  const token = await getAccessToken();
  if (!token) throw new Error("NO_SESSION");
  return token;
}

export async function getRefreshToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(REFRESH_TOKEN_COOKIE)?.value;
}
