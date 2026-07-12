export const OBJECTIVE_OPTIONS: Array<{
  value: string;
  label: string;
  description: string;
}> = [
  {
    value: "SELL",
    label: "Quiero vender",
    description: "Busco un precio justo para publicarla o venderla directamente.",
  },
  {
    value: "BUY",
    label: "Quiero comprar",
    description: "Quiero confirmar si el precio que me piden es razonable.",
  },
  {
    value: "IDENTIFY",
    label: "Quiero identificar",
    description: "No sé qué es exactamente — diseñador, época, procedencia.",
  },
  {
    value: "RESTORE",
    label: "Quiero restaurar",
    description: "Necesito saber su estado real antes de intervenirla.",
  },
];

export const OBJECTIVE_LABELS: Record<string, string> = Object.fromEntries(
  OBJECTIVE_OPTIONS.map((option) => [option.value, option.label]),
);

export const VALUATION_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Borrador",
  PENDING: "En cola",
  IN_REVIEW: "En revisión",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
};

export const WIZARD_STEPS = [
  { step: 1, label: "Fotografías" },
  { step: 2, label: "Información" },
  { step: 3, label: "Objetivo" },
  { step: 4, label: "Resumen" },
  { step: 5, label: "Pago" },
] as const;
