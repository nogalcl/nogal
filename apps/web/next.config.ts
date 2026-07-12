import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pnpm resuelve las dependencias del workspace desde node_modules en la
  // raíz del monorepo; el root de Turbopack debe cubrir esa ruta.
  turbopack: {
    root: path.join(process.cwd(), "../.."),
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Disco local de apps/api en desarrollo. En producción se sustituye
      // por el dominio del CDN (Cloudflare + R2/Supabase Storage) — ver
      // ARCHITECTURE.md.
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/uploads/**",
      },
      // Fotografías reales de reemplazo para el catálogo de datos de
      // ejemplo (ver seed.ts) — no hay todavía subida real de usuarios.
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "fastly.picsum.photos",
        pathname: "/**",
      },
      // Fotografía editorial de licencia libre para la sección Tendencias
      // (ver packages/database/prisma/seed.ts, seedTrends) — Wikimedia
      // Commons es la fuente preferida por su licenciamiento verificable.
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/**",
      },
    ],
    // Next.js bloquea por defecto optimizar imágenes servidas desde IPs
    // privadas/loopback (protección SSRF). En desarrollo el "CDN" es
    // localhost:4000 (ver arriba), así que se habilita explícitamente; en
    // producción el origen será un dominio público real y esto deja de
    // aplicar.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
  },
  experimental: {
    serverActions: {
      // Fotografías de piezas: debe cubrir el límite de 15MB del backend.
      bodySizeLimit: "15mb",
    },
  },
};

export default nextConfig;
