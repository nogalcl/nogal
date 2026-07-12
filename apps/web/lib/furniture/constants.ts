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

export const CURRENCY_OPTIONS = [
  { value: "CLP", label: "CLP — Peso chileno" },
  { value: "USD", label: "USD — Dólar estadounidense" },
  { value: "EUR", label: "EUR — Euro" },
];

export const SHIPPING_METHOD_OPTIONS = [
  { value: "STANDARD", label: "Envío estándar" },
  { value: "WHITE_GLOVE", label: "Entrega white-glove" },
  { value: "PICKUP_ONLY", label: "Retiro en persona" },
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
