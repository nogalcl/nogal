export const ESTATE_LIQUIDATION_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Borrador",
  PENDING: "En cola",
  IN_REVIEW: "En revisión",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
};

export const OUTCOME_LABELS: Record<string, string> = {
  SELL_ON_NOGAL: "Venta en Nogal",
  REFER_RESTORER: "Derivar a restaurador",
  INFORM_ONLY: "Solo informar",
};

export const OUTCOME_OPTIONS = [
  { value: "SELL_ON_NOGAL", label: "Venta en Nogal" },
  { value: "REFER_RESTORER", label: "Derivar a restaurador" },
  { value: "INFORM_ONLY", label: "Solo informar" },
];

export const WIZARD_STEPS = [
  { step: 1, label: "Contacto y visita" },
  { step: 2, label: "Piezas" },
  { step: 3, label: "Resumen" },
  { step: 4, label: "Pago" },
] as const;
