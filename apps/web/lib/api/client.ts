import "server-only";
import { GraphQLClient } from "graphql-request";
import { env } from "@/lib/env";

export function createApiClient(accessToken?: string): GraphQLClient {
  return new GraphQLClient(env.API_URL, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
}

export function extractErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: unknown }).response === "object"
  ) {
    const response = (
      error as {
        response: {
          errors?: Array<{
            message?: string;
            extensions?: {
              originalError?: { message?: string | string[] };
            };
          }>;
        };
      }
    ).response;
    const graphqlError = response.errors?.[0];
    // El mensaje de nivel superior de Nest (p. ej. "Bad Request Exception")
    // no dice nada útil al usuario — el detalle real de class-validator vive
    // en extensions.originalError.message, a veces como arreglo.
    const originalMessage = graphqlError?.extensions?.originalError?.message;
    if (Array.isArray(originalMessage) && originalMessage.length > 0) {
      return originalMessage.join(" ");
    }
    if (typeof originalMessage === "string") return originalMessage;
    if (graphqlError?.message) return graphqlError.message;
  }
  return "Ocurrió un error inesperado. Inténtalo de nuevo.";
}
