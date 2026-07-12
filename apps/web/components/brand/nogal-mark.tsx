/**
 * Isotipo de Nogal: abanico de arcos concéntricos anclados en la esquina
 * inferior izquierda — recreación provisional en SVG del concepto de marca
 * (board "Concepto 2") mientras se reciben los archivos finales del
 * diseñador. Hereda color vía `currentColor` para adaptarse a claro/oscuro.
 */
const ARC_RADII = [12, 26, 42, 58, 74, 92] as const;

export function NogalMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth={4}
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      {ARC_RADII.map((r) => (
        <path key={r} d={`M 0 ${100 - r} A ${r} ${r} 0 0 1 ${r} 100`} />
      ))}
    </svg>
  );
}
