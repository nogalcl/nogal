import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN_DAYS: z.coerce.number().int().positive().default(30),
  WEB_APP_URL: z.string().url().default("http://localhost:3000"),
  API_URL: z.string().url().default("http://localhost:4000"),
  // Almacenamiento de imágenes: "local" (disco, solo dev) o "r2"
  // (Cloudflare R2) detrás de la misma interfaz StorageProvider (ver
  // modules/storage). Nada en el resto del código depende de cuál se use.
  STORAGE_PROVIDER: z.enum(["local", "r2"]).default("local"),
  UPLOADS_DIR: z.string().default("./uploads"),
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().optional(),
  // Dominio público del bucket (r2.dev o dominio propio conectado) — sin
  // slash final.
  R2_PUBLIC_URL: z.string().url().optional(),
  // Correo transaccional: "log" (solo consola, dev) o "resend" (producción).
  MAIL_PROVIDER: z.enum(["log", "resend"]).default("log"),
  RESEND_API_KEY: z.string().optional(),
  MAIL_FROM: z.string().default("Nogal <onboarding@resend.dev>"),
})
  .refine(
    (env) =>
      env.STORAGE_PROVIDER !== "r2" ||
      (env.R2_ACCOUNT_ID && env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY && env.R2_BUCKET_NAME && env.R2_PUBLIC_URL),
    {
      message:
        "STORAGE_PROVIDER=r2 requiere R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME y R2_PUBLIC_URL.",
      path: ["STORAGE_PROVIDER"],
    },
  )
  .refine((env) => env.MAIL_PROVIDER !== "resend" || env.RESEND_API_KEY, {
    message: "MAIL_PROVIDER=resend requiere RESEND_API_KEY.",
    path: ["MAIL_PROVIDER"],
  });

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    throw new Error(
      `Variables de entorno inválidas:\n${parsed.error.issues
        .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
        .join("\n")}`,
    );
  }
  return parsed.data;
}
