import "server-only";
import { redirect } from "next/navigation";
import { fetchCurrentUser, type AuthUser } from "@/lib/api/auth";
import { getAccessToken } from "./session";

/** Server Components-only: exige sesión + rol, o redirige. Centraliza la
 * misma comprobación repetida en cada página del panel admin / experto. */
export async function requireStaff(
  allowedRoles: Array<"MODERATOR" | "ADMIN">,
  nextPath: string,
): Promise<{ accessToken: string; user: AuthUser }> {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    redirect(`/iniciar-sesion?next=${encodeURIComponent(nextPath)}`);
  }

  const user = await fetchCurrentUser(accessToken);
  if (!user || !allowedRoles.includes(user.role as "MODERATOR" | "ADMIN")) {
    redirect("/");
  }

  return { accessToken, user };
}
