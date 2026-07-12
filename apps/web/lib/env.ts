import "server-only";
import { z } from "zod";

const envSchema = z.object({
  API_URL: z.string().url().default("http://localhost:4000/graphql"),
  // Debe ser idéntico al JWT_ACCESS_SECRET de apps/api: el middleware
  // verifica aquí la firma del access token sin llamar a la API.
  JWT_ACCESS_SECRET: z.string().min(32),
});

export const env = envSchema.parse({
  API_URL: process.env.API_URL,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
});

/** Origen de la API sin el sufijo /graphql, para endpoints REST (subida de imágenes). */
export const apiBaseUrl = env.API_URL.replace(/\/graphql\/?$/, "");
