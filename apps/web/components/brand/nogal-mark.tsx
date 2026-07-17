/**
 * Isotipo de Nogal: corte transversal de tronco — anillos de crecimiento
 * irregulares con la médula marcada al centro. Hereda color vía
 * `currentColor` para adaptarse a claro/oscuro.
 */
export function NogalMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      className={className}
      aria-hidden="true"
    >
      <circle cx="50" cy="52" r="4" fill="currentColor" stroke="none" />
      <path
        d="M50 52 m-16,-1 a16,15 2 1 1 32,3 a16,17 -3 1 1 -32,-3"
        strokeWidth={2.5}
      />
      <path
        d="M50 52 m-28,2 a28,27 -2 1 1 56,-3 a28,29 3 1 1 -56,3"
        strokeWidth={2.5}
      />
      <path
        d="M50 52 m-40,-2 a40,39 1 1 1 80,3 a40,41 -1 1 1 -80,-3"
        strokeWidth={2}
      />
    </svg>
  );
}
