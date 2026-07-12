import type { TrendCategory } from "@/lib/api/types";

export const TREND_CATEGORY_LABELS: Record<TrendCategory, string> = {
  NEWS: "Noticias",
  MARKET: "Mercado",
  DESIGN: "Diseño",
  MATERIAL: "Materiales",
  DESIGNER: "Diseñadores",
  MANUFACTURER: "Fabricantes",
  ICONIC_PIECE: "Piezas icónicas",
};

export const TREND_CATEGORY_OPTIONS: Array<{ value: TrendCategory; label: string }> = [
  { value: "NEWS", label: "Noticias" },
  { value: "MARKET", label: "Mercado" },
  { value: "DESIGN", label: "Diseño" },
  { value: "MATERIAL", label: "Materiales" },
  { value: "DESIGNER", label: "Diseñadores" },
  { value: "MANUFACTURER", label: "Fabricantes" },
  { value: "ICONIC_PIECE", label: "Piezas icónicas" },
];
