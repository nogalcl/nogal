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
      error as { response: { errors?: Array<{ message?: string }> } }
    ).response;
    const message = response.errors?.[0]?.message;
    if (message) return message;
  }
  return "Ocurrió un error inesperado. Inténtalo de nuevo.";
}
