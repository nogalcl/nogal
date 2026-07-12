# DEVELOPMENT_RULES.md — Nogal

Reglas de ingeniería que se aplican durante todo el desarrollo del proyecto, sin excepción salvo decisión explícita y documentada (ADR en `docs/`).

## 1. Tipado y calidad de código

- **TypeScript estricto (`strict: true`) en todo el monorepo**, frontend y backend. Prohibido `any` salvo en los límites de librerías de terceros sin tipos, y siempre aislado con un comentario explicando por qué.
- **Sin duplicación de lógica de negocio.** Si una regla de negocio (p. ej. cálculo de comisión, validación de dimensiones mínimas para envío estándar) se necesita en más de un lugar, vive en `apps/api` y se expone vía API — nunca se reimplementa en el frontend "por rapidez".
- **Componentes reutilizables por diseño, no por accidente.** Un componente se extrae a `packages/ui` cuando se usa en más de un contexto real, no de forma especulativa "por si acaso" (ver también DESIGN_PRINCIPLES.md — reutilizable no significa genérico: los componentes reutilizables siguen nombrados y diseñados según el dominio, no como widgets neutros).
- **Código autodocumentado.** Nombres de variables, funciones y componentes deben explicar su propósito sin necesidad de comentario. Comentarios solo cuando explican un "por qué" no evidente (una restricción externa, una decisión contraintuitiva) — nunca comentarios que repiten lo que el código ya dice.
- **Sin abstracciones prematuras.** No se introduce una capa de abstracción (factory, plugin system, config genérica) hasta que exista un segundo caso real que la necesite.

## 2. Accesibilidad

- Cumplimiento **WCAG 2.1 AA** como mínimo exigible, no aspiracional.
- Todo elemento interactivo debe ser operable por teclado y tener foco visible (con un estilo de foco propio de marca, no el `outline` azul por defecto del navegador, pero nunca eliminado sin reemplazo).
- Contraste de color verificado explícitamente para la paleta editorial (algunos tonos cálidos/oscuros de la paleta de marca pueden no cumplir contraste por defecto sobre ciertos fondos — se valida par por par, no se asume).
- Texto alternativo obligatorio y descriptivo en toda imagen de producto (además de su valor SEO, ver §3).
- Componentes interactivos complejos (galerías, comboboxes de filtro, modales) se construyen sobre primitivos accesibles (Radix UI), nunca desde cero reimplementando semántica ARIA.

## 3. SEO

- **SSR/SSG/ISR por defecto** en toda página de catálogo pública (ficha de producto, listados, colecciones, perfiles de vendedor). Ninguna página de descubrimiento depende de renderizado exclusivamente client-side.
- **Datos estructurados (schema.org)**: `Product`, `Offer`, `BreadcrumbList`, `Organization` en las páginas correspondientes desde el MVP.
- **URLs legibles y estables** basadas en slug (`/piezas/consola-nogal-danesa-1960`), nunca solo IDs opacos.
- **Metadatos únicos por página** (title, description, Open Graph con imagen real de la pieza) generados a partir del contenido, nunca genéricos ni duplicados.
- **Sitemap dinámico** regenerado a partir del catálogo publicado.

## 4. Performance

- **Presupuesto de Core Web Vitals** como criterio de aceptación, no como métrica que se revisa "después": LCP objetivo < 2.5s en ficha de producto, CLS < 0.1 (crítico dado el peso visual de las imágenes), INP dentro de los umbrales "good" de Google.
- **Toda imagen de producto pasa por el pipeline de optimización** (formatos modernos, tamaños responsivos, lazy loading fuera del viewport inicial) — nunca se sirve un original sin procesar.
- **Sin JavaScript innecesario en el cliente**: se prioriza React Server Components y HTML/CSS para lo que no requiere interactividad; el JS de cliente se reserva para lo que realmente necesita estado o eventos.
- **Medición continua**: Lighthouse/Web Vitals integrado en CI para detectar regresiones antes de merge, no solo monitoreo post-despliegue.

## 5. Mobile first

- Todo componente y layout se diseña y construye primero para viewport móvil, y se expande hacia desktop — nunca al revés.
- Los flujos críticos (búsqueda, ficha de producto, mensajería, checkout) deben probarse explícitamente en móvil antes de considerarse terminados, dado que una parte significativa del descubrimiento inicial (búsqueda orgánica) llegará desde móvil.

## 6. Arquitectura limpia (Clean Architecture)

- **Separación estricta de capas en el backend**: los resolvers/controllers no contienen lógica de negocio (solo orquestan input/output); los `services` contienen las reglas de negocio; los `repositories` son el único punto de acceso a Prisma/base de datos. Un `service` nunca importa Prisma directamente.
- **El dominio no depende de frameworks.** Las reglas de negocio críticas (cálculo de comisión, validación de reglas de BUSINESS_RULES.md) deben poder testearse sin levantar NestJS ni una base de datos real.
- **Los módulos no acceden a las tablas internas de otros módulos directamente** (ver PROJECT_STRUCTURE.md §2.4) — se comunican por su interfaz pública (`service`), preservando la posibilidad real de extraer un módulo a microservicio en el futuro.

## 7. Testing

- Ninguna regla de negocio de BUSINESS_RULES.md se considera implementada sin un test que la verifique explícitamente (p. ej. "un listing con menos de 6 fotos no puede pasar a `PUBLISHED`").
- Flujos críticos cubiertos end-to-end con Playwright: publicar listing, buscar y filtrar, realizar una compra completa, enviar un mensaje, moderar (aprobar/rechazar) un listing.
- Regresión visual (Chromatic/Percy) obligatoria en componentes de `packages/ui` y en las plantillas de página principales, dado que una regresión visual en este producto es tan grave como un bug funcional.

## 8. Proceso de desarrollo

- **Conventional Commits** (`feat:`, `fix:`, `refactor:`, `docs:`...) para mantener historial legible y habilitar generación automática de changelog.
- **Pull requests obligatorios** con al menos una revisión antes de merge a `main`; CI (lint, typecheck, test, build) debe pasar en verde antes de poder mergear.
- **Sin flags de feature permanentes**: los feature flags se usan para despliegues progresivos o pruebas A/B puntuales, y se retiran del código en cuanto la decisión se toma — no se acumulan como deuda técnica de configuración.
- **Decisiones arquitectónicas relevantes se documentan como ADR** en `docs/adr/`, no solo se discuten y se olvidan — este proyecto está pensado para sostenerse y evolucionar durante años, y el razonamiento detrás de una decisión es tan valioso como la decisión misma.
