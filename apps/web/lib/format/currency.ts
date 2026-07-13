/**
 * CLP no usa decimales en el uso cotidiano — Intl.NumberFormat con
 * currency:"CLP" ya lo maneja así, pero se fija explícitamente por si en
 * el futuro se soportan otras monedas con decimales (ver Furniture.currency
 * en el schema).
 */
export function formatPrice(
  amount: number | null,
  currency: string,
): string {
  if (amount == null) return "Precio a consultar";
  try {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "CLP" ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString("es-CL")} ${currency}`;
  }
}
