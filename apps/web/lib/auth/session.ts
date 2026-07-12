import "server-only";
import { cookies } from "next/headers";
import type { AuthPayload } from "@/lib/api/auth";

const ACCESS_TOKEN_COOKIE = "nogal_access_token";
const REFRESH_TOKEN_COOKIE = "nogal_refresh_token";

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
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(ACCESS_TOKEN_COOKIE);
  store.delete(REFRESH_TOKEN_COOKIE);
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
