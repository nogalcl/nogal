import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import type {
  ValuationAiInput,
  ValuationAiProvider,
  ValuationAiSuggestion,
} from "../valuation-ai.interface";

/**
 * Implementación por defecto — sin proveedor de IA conectado. Lanza
 * explícitamente en vez de inventar una sugerencia falsa; el panel experto
 * sigue funcionando 100% manual mientras este sea el provider activo (ver
 * valuation-ai.module.ts).
 */
@Injectable()
export class UnavailableValuationAiProvider implements ValuationAiProvider {
  readonly name = "unavailable";

  async suggest(_input: ValuationAiInput): Promise<ValuationAiSuggestion> {
    throw new ServiceUnavailableException(
      "La sugerencia asistida por IA todavía no está disponible.",
    );
  }
}
