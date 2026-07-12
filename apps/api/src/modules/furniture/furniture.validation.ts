import { BadRequestException, Injectable } from "@nestjs/common";
import type { FurnitureWithRelations } from "./furniture.repository";

const MIN_IMAGES_TO_PUBLISH = 6;

/**
 * Reglas de negocio para publicar una pieza (ver BUSINESS_RULES.md §2).
 * Separado de FurnitureService para poder testear las reglas de forma
 * aislada y para que el mensaje de error liste TODO lo que falta de una vez,
 * no un campo a la vez.
 */
@Injectable()
export class FurnitureValidationService {
  assertPublishable(furniture: FurnitureWithRelations): void {
    const missing: string[] = [];

    if (furniture.images.length < MIN_IMAGES_TO_PUBLISH) {
      missing.push(
        `Añade al menos ${MIN_IMAGES_TO_PUBLISH} fotografías (tienes ${furniture.images.length}).`,
      );
    }
    if (!furniture.widthCm || !furniture.heightCm || !furniture.depthCm) {
      missing.push("Completa ancho, alto y profundidad.");
    }
    if (!furniture.price || Number(furniture.price) <= 0) {
      missing.push("Indica un precio válido.");
    }
    if (!furniture.description || furniture.description.trim().length < 20) {
      missing.push("La descripción debe tener al menos 20 caracteres.");
    }
    if (furniture.shippingMethods.length === 0) {
      missing.push("Selecciona al menos un método de envío o entrega.");
    }

    if (missing.length > 0) {
      throw new BadRequestException(
        `Antes de publicar, completa lo siguiente: ${missing.join(" ")}`,
      );
    }
  }
}
