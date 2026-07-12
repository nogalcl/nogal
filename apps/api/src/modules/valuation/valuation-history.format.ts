import type { Prisma } from "@nogal/database";

function str(metadata: Prisma.JsonValue, key: string): string | null {
  if (typeof metadata !== "object" || metadata === null || Array.isArray(metadata)) {
    return null;
  }
  const value = (metadata as Record<string, unknown>)[key];
  return typeof value === "string" ? value : null;
}

/** Traduce una fila de AuditLog (action + metadata) a una frase legible
 * para el historial del panel experto — igual patrón que
 * notifications/notification.format.ts. */
export function formatValuationHistory(
  action: string,
  metadata: Prisma.JsonValue,
): string {
  switch (action) {
    case "valuation.submitted":
      return "Solicitud enviada y pagada.";
    case "valuation.assigned": {
      const expertName = str(metadata, "expertName") ?? "un especialista";
      return `Asignada a ${expertName}.`;
    }
    case "valuation.status_changed": {
      const to = str(metadata, "to");
      return to ? `Estado cambiado a ${to}.` : "Estado actualizado.";
    }
    case "valuation.report_created":
      return "Informe generado.";
    case "valuation.report_updated":
      return "Informe actualizado.";
    case "valuation.cancelled":
      return "Solicitud cancelada.";
    default:
      return action;
  }
}
