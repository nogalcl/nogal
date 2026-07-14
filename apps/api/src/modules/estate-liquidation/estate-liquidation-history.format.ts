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
 * valuation-history.format.ts. */
export function formatEstateLiquidationHistory(
  action: string,
  metadata: Prisma.JsonValue,
): string {
  switch (action) {
    case "estate_liquidation.submitted":
      return "Solicitud enviada y pagada.";
    case "estate_liquidation.assigned": {
      const expertName = str(metadata, "expertName") ?? "un especialista";
      return `Asignada a ${expertName}.`;
    }
    case "estate_liquidation.status_changed": {
      const to = str(metadata, "to");
      return to ? `Estado cambiado a ${to}.` : "Estado actualizado.";
    }
    case "estate_liquidation.piece_classified": {
      const title = str(metadata, "pieceTitle") ?? "una pieza";
      return `Se clasificó "${title}".`;
    }
    case "estate_liquidation.completed":
      return "Revisión marcada como completa.";
    case "estate_liquidation.cancelled":
      return "Solicitud cancelada.";
    default:
      return action;
  }
}
