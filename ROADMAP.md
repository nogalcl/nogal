# ROADMAP.md — Nogal

El roadmap prioriza primero **confianza y descubrimiento** (sin esto no hay marketplace), después **profundidad de negociación y curaduría**, y finalmente **escala operativa y expansión**. Cada fase asume que la anterior está en producción y estable, no en paralelo.

## Fase 0 — Fundacional (pre-MVP)

Infraestructura y cimientos que no son visibles para el usuario pero condicionan todo lo demás:

- Monorepo, CI/CD, entornos (staging/producción).
- Esquema de base de datos inicial (usuarios, listings, categorías, medios).
- Sistema de diseño base (`packages/ui`) con tokens de marca ya definidos — **no se construye ni una sola pantalla sin el sistema de diseño primero**, para evitar deuda visual desde el día uno.
- Autenticación y roles (comprador/vendedor/admin).
- Pipeline de medios (subida, procesado, CDN).

## MVP — Fase 1

Objetivo: un marketplace funcional, de confianza mínima viable, con transacción real de principio a fin.

- Catálogo público con navegación por categoría y ficha de producto (galería grande, procedencia, condición, dimensiones).
- Búsqueda y filtrado facetado (categoría, material, época, precio, dimensiones).
- Alta de vendedor con verificación KYC (Stripe Connect/Identity).
- Publicación de listing con moderación manual previa a publicarse.
- Mensajería básica comprador–vendedor (sin tiempo real, refetch/polling).
- Checkout de precio fijo vía Stripe Connect (sin negociación todavía).
- Reseñas bidireccionales post-compra.
- Panel de administración: cola de moderación de listings y vendedores, gestión básica de reportes.
- SEO técnico base (SSR, metadatos, datos estructurados `Product`/`Offer` de schema.org).

**Criterio de salida del MVP**: un comprador puede encontrar una pieza por búsqueda orgánica, contactar al vendedor, pagar de forma segura, y dejar una reseña — todo sin intervención manual del equipo salvo la moderación de contenido.

## V2 — Profundidad de negociación y curaduría

- Ofertas y contraofertas sobre listings (negociación de precio con expiración).
- Colecciones editoriales curadas (por admin y por vendedores destacados) — refuerza el posicionamiento de galería/editorial frente a "marketplace más".
- Favoritos y búsquedas guardadas con alertas (bajada de precio, piezas similares nuevas).
- Perfiles de vendedor enriquecidos ("Ateliers"): biografía, especialidad, catálogo propio navegable, nivel de verificación visible.
- Niveles de vendedor (`Nuevo`/`Verificado`/`Distinguido`) con impacto en visibilidad.
- Mensajería en tiempo real (WebSocket) si el volumen de conversaciones lo justifica.
- Métodos de envío diferenciados, incluyendo White Glove, con selección obligatoria según tamaño/peso del listing.
- Métricas internas para vendedores (vistas, favoritos, conversión) — **presentadas de forma editorial y sobria, nunca como un dashboard de analítica genérico** (ver DESIGN_PRINCIPLES.md).

## V3 — Escala y diferenciación de mercado

- Subastas con tiempo límite para piezas de colección de alto valor, como alternativa al precio fijo/oferta.
- Servicio de autenticación/tasación asistida: flujo donde un experto (interno o partner) puede emitir un certificado de procedencia/autenticidad adjunto al `ProvenanceRecord` — tratado como servicio de confianza, no como feature de "IA" expuesta al usuario.
- Envíos e impuestos internacionales (multi-moneda, cálculo de aranceles para envíos transfronterizos de piezas de colección).
- Integraciones logísticas con transportistas especializados en mobiliario/arte (tracking real, seguros de transporte).
- Aplicación móvil (consumo del mismo backend GraphQL).
- Programa para galerías/anticuarios profesionales con catálogo gestionado en volumen (herramientas de publicación por lotes).
- API/​integraciones para partners (embeber catálogo o piezas seleccionadas en sitios de terceros).

## Largo plazo

- Eventos y exhibiciones físicas/híbridas ligadas a colecciones destacadas, con la plataforma como catálogo digital de la exhibición.
- Programa de autenticación de referencia en la industria: que un certificado emitido a través de Nogal tenga valor reconocido más allá de la propia plataforma.
- Expansión regional dedicada (moneda, logística, curaduría local) en mercados con fuerte cultura de diseño/anticuariado (DACH, Escandinavia, Reino Unido, Norteamérica).
- Posible modelo B2B: canal mayorista para diseñadores de interiores y estudios de arquitectura con acceso preferente a piezas antes de su publicación general.

## Notas de secuenciación

- **Las subastas se posponen deliberadamente a V3**: introducen complejidad legal y de producto (pujas, garantías de pago, tiempo real) que no debe bloquear el MVP; el modelo de precio fijo + oferta cubre la mayoría de casos de uso iniciales.
- **La app móvil se pospone a V3**: el descubrimiento inicial depende fuertemente de SEO web; una app nativa sin base de usuarios previa aporta poco valor frente al coste de mantenerla.
- **Ninguna fase introduce funciones de "IA conversacional" de cara al usuario**: es una decisión de producto explícita, coherente con DESIGN_PRINCIPLES.md — el posicionamiento es de galería/casa de subastas, no de startup tecnológica.
