export const siteConfig = {
  name: "Nogal",
  tagline: "Mobiliario de diseño, antigüedades y piezas de colección",
  description:
    "Nogal es un espacio para mobiliario de alta calidad, diseño de autor y antigüedades verificadas — piezas únicas, con procedencia documentada y vendedores curados.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  // TODO: reemplazar por el correo de contacto real antes de publicar.
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "hola@nogal.cl",
} as const;
