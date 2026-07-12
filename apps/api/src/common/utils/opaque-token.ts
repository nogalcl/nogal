import { createHash, randomBytes } from "node:crypto";

/**
 * Tokens opacos (no JWT) usados para refresh tokens, verificación de email y
 * reseteo de contraseña: solo su hash SHA-256 se persiste, nunca el valor
 * en claro, para que una fuga de la base de datos no los deje reutilizables.
 */
export function generateOpaqueToken(bytes = 32): string {
  return randomBytes(bytes).toString("hex");
}

export function hashOpaqueToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
