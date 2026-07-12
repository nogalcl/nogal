import type { NotificationType, Prisma } from "@nogal/database";

export interface FormattedNotification {
  message: string;
  link: string | null;
}

function str(payload: Prisma.JsonValue, key: string): string | null {
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return null;
  }
  const value = (payload as Record<string, unknown>)[key];
  return typeof value === "string" ? value : null;
}

/**
 * Traduce type + payload interno a un mensaje/enlace ya listos para
 * mostrar. Vive separado del resolver para poder testearlo como función
 * pura. El payload es de forma libre por diseño (ver schema.prisma) — cada
 * caso aquí solo lee las claves que el creador de esa notificación
 * garantiza (ver notifications.service.ts).
 */
export function formatNotification(
  type: NotificationType,
  payload: Prisma.JsonValue,
): FormattedNotification {
  switch (type) {
    case "NEW_MESSAGE": {
      const senderName = str(payload, "senderName") ?? "Alguien";
      const conversationId = str(payload, "conversationId");
      return {
        message: `${senderName} te envió un mensaje.`,
        link: conversationId ? `/mensajes/${conversationId}` : "/mensajes",
      };
    }
    case "NEW_FOLLOWER": {
      const followerName = str(payload, "followerName") ?? "Alguien";
      const followerUsername = str(payload, "followerUsername");
      return {
        message: `${followerName} comenzó a seguirte.`,
        link: followerUsername ? `/perfil/${followerUsername}` : null,
      };
    }
    case "FURNITURE_FAVORITED": {
      const title = str(payload, "furnitureTitle") ?? "tu pieza";
      const slug = str(payload, "furnitureSlug");
      return {
        message: `A alguien le gustó "${title}".`,
        link: slug ? `/piezas/${slug}` : null,
      };
    }
    case "FURNITURE_SOLD": {
      const title = str(payload, "furnitureTitle") ?? "Una pieza que guardaste";
      const slug = str(payload, "furnitureSlug");
      return {
        message: `"${title}" ya no está disponible — se marcó como vendida.`,
        link: slug ? `/piezas/${slug}` : null,
      };
    }
    case "LISTING_APPROVED": {
      const title = str(payload, "furnitureTitle") ?? "Tu pieza";
      const slug = str(payload, "furnitureSlug");
      return {
        message: `"${title}" fue aprobada y ya está publicada.`,
        link: slug ? `/piezas/${slug}` : null,
      };
    }
    case "LISTING_REJECTED": {
      const title = str(payload, "furnitureTitle") ?? "Tu pieza";
      const reason = str(payload, "reason");
      return {
        message: reason
          ? `"${title}" fue rechazada: ${reason}`
          : `"${title}" fue rechazada en la revisión.`,
        link: "/vender/piezas",
      };
    }
    case "MODERATION_ACTION": {
      const status = str(payload, "status");
      return {
        message: status
          ? `Tu reporte fue revisado — estado: ${status}.`
          : "Hay una novedad de moderación en un reporte que enviaste.",
        link: null,
      };
    }
    case "VALUATION_READY": {
      const title = str(payload, "requestTitle");
      const requestId = str(payload, "requestId");
      return {
        message: title
          ? `Tu informe de valoración para "${title}" está listo.`
          : "Tu informe de valoración está listo.",
        link: requestId ? `/valoracion-express/solicitudes/${requestId}` : null,
      };
    }
    case "NEW_OFFER":
      return {
        message: "Recibiste una nueva oferta.",
        link: null,
      };
    case "SYSTEM":
    default: {
      const message = str(payload, "message") ?? "Tienes una notificación nueva.";
      return { message, link: str(payload, "link") };
    }
  }
}
