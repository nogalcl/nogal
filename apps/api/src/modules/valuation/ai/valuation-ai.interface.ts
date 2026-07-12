/**
 * Abstracción de un proveedor de IA capaz de sugerir una identificación
 * preliminar de una pieza a partir de sus fotos y la información que
 * aportó el solicitante. NINGÚN proveedor real está implementado en este
 * sprint (ver ROADMAP.md V3) — esto es solo la interfaz + un stub que
 * lanza "no disponible", para que el resto del sistema (wizard, panel
 * experto, informe) pueda diseñarse ya asumiendo que la sugerencia
 * existirá, sin acoplarse a ningún SDK concreto.
 *
 * Para conectar un proveedor real más adelante:
 *   1. Crear `providers/openai-valuation-ai.provider.ts` (o anthropic-,
 *      o el que sea) implementando `ValuationAiProvider`.
 *   2. Registrarlo en `valuation-ai.module.ts` en lugar de
 *      `UnavailableValuationAiProvider`, típicamente detrás de una
 *      variable de entorno (`AI_PROVIDER=openai|anthropic`).
 *   3. Nada en `valuation.service.ts` ni en el resolver cambia: ambos
 *      dependen de `VALUATION_AI_PROVIDER`, nunca de un SDK concreto —
 *      mismo patrón que `StorageProvider` (ver modules/storage).
 */
export interface ValuationAiImageInput {
  url: string;
}

export interface ValuationAiInput {
  images: ValuationAiImageInput[];
  title?: string | null;
  description?: string | null;
  objective?: string | null;
}

export interface ValuationAiSuggestion {
  probableIdentification?: string;
  materialNames?: string[];
  woodTypeNames?: string[];
  styleName?: string;
  decade?: number;
  designerName?: string;
  manufacturerName?: string;
  estimatedValueMin?: number;
  estimatedValueMax?: number;
  /** 0-100. */
  confidenceLevel?: number;
  rawNotes?: string;
}

export interface ValuationAiProvider {
  /** Identificador corto para logs/diagnóstico (p. ej. "openai", "anthropic", "unavailable"). */
  readonly name: string;
  suggest(input: ValuationAiInput): Promise<ValuationAiSuggestion>;
}

export const VALUATION_AI_PROVIDER = "VALUATION_AI_PROVIDER";
