import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Radios del isotipo (ver components/brand/nogal-mark.tsx) — duplicado aquí
// en lugar de importado porque next/og renderiza vía satori, no vía DOM/
// Tailwind, y este contexto necesita un color de trazo fijo (no currentColor).
const ARC_RADII = [12, 26, 42, 58, 74, 92];

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#1a1815",
      }}
    >
      <svg width="24" height="24" viewBox="0 0 100 100" fill="none">
        {ARC_RADII.map((r) => (
          <path
            key={r}
            d={`M 0 ${100 - r} A ${r} ${r} 0 0 1 ${r} 100`}
            stroke="#ede4d3"
            strokeWidth={7}
            strokeLinecap="round"
          />
        ))}
      </svg>
    </div>,
    size,
  );
}
