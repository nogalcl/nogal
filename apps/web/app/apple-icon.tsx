import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Ver nota en icon.tsx sobre por qué se duplican los radios aquí.
const ARC_RADII = [12, 26, 42, 58, 74, 92];

export default function AppleIcon() {
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
      <svg width="130" height="130" viewBox="0 0 100 100" fill="none">
        {ARC_RADII.map((r) => (
          <path
            key={r}
            d={`M 0 ${100 - r} A ${r} ${r} 0 0 1 ${r} 100`}
            stroke="#ede4d3"
            strokeWidth={6}
            strokeLinecap="round"
          />
        ))}
      </svg>
    </div>,
    size,
  );
}
