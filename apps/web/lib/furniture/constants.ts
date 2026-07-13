// El backend exige este mínimo para pasar de DRAFT a revisión (ver
// MIN_IMAGES_TO_PUBLISH en apps/api/.../furniture.validation.ts) — se
// duplica aquí solo como valor de referencia para la UI, no como validación.
export const MIN_IMAGES_TO_PUBLISH = 3;
export const MAX_IMAGES = 20;

export const CONDITION_OPTIONS = [
  { value: "EXCELLENT", label: "Excelente" },
  { value: "VERY_GOOD", label: "Muy bueno" },
  { value: "GOOD", label: "Bueno" },
  { value: "RESTORED", label: "Restaurado" },
  { value: "FOR_RESTORATION", label: "Para restaurar" },
];

export const ORIGINALITY_OPTIONS = [
  { value: "ORIGINAL", label: "Original de época" },
  { value: "REPRODUCTION", label: "Reproducción" },
];

export const PRICE_TYPE_OPTIONS = [
  { value: "FIXED", label: "Precio fijo" },
  { value: "OFFER", label: "Acepta ofertas" },
];

export const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Borrador",
  UNDER_REVIEW: "En revisión",
  PUBLISHED: "Publicada",
  RESERVED: "Reservada",
  SOLD: "Vendida",
  ARCHIVED: "Archivada",
  REJECTED: "Rechazada",
};

export const CONDITION_LABELS: Record<string, string> = Object.fromEntries(
  CONDITION_OPTIONS.map((option) => [option.value, option.label]),
);
