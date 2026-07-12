# PROJECT_STRUCTURE.md — Nogal

Este documento define la organización del código fuente. Se adopta un **monorepo** gestionado con Turborepo (o Nx como alternativa equivalente), justificado por:

- El frontend (web + admin) y el backend comparten tipos de dominio (`Listing`, `Order`, `User`...); un monorepo permite compartirlos sin publicar paquetes npm internos.
- Habilita cambios atómicos: un cambio de esquema en Prisma y su tipo correspondiente en frontend se revisan y despliegan en el mismo PR.
- Facilita añadir nuevas apps en el futuro (app móvil, panel de vendedores dedicado) reutilizando el sistema de diseño y los tipos ya existentes.

## 1. Estructura completa de carpetas

```
nogal/
├── apps/
│   ├── web/                        # Next.js — tienda pública (compradores y vendedores)
│   │   ├── app/
│   │   │   ├── (marketing)/        # Home, sobre nosotros, editorial/journal
│   │   │   ├── (catalog)/
│   │   │   │   ├── piezas/
│   │   │   │   │   ├── [slug]/     # Ficha de producto
│   │   │   │   │   └── page.tsx    # Listado/búsqueda
│   │   │   │   ├── colecciones/
│   │   │   │   └── ateliers/       # Perfiles de vendedores/galerías
│   │   │   ├── (account)/
│   │   │   │   ├── favoritos/
│   │   │   │   ├── mensajes/
│   │   │   │   ├── pedidos/
│   │   │   │   └── vender/         # Flujo de publicación para vendedores
│   │   │   ├── (checkout)/
│   │   │   └── layout.tsx
│   │   ├── features/               # Lógica de dominio agrupada por feature, no por tipo de archivo
│   │   │   ├── catalog/
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   ├── graphql/        # queries/mutations + tipos generados
│   │   │   │   └── utils/
│   │   │   ├── seller-onboarding/
│   │   │   ├── messaging/
│   │   │   ├── checkout/
│   │   │   └── favorites/
│   │   ├── public/
│   │   └── next.config.ts
│   │
│   ├── admin/                      # Next.js — panel interno de moderación y operaciones
│   │   ├── app/
│   │   │   ├── moderacion/
│   │   │   ├── vendedores/
│   │   │   ├── pedidos/
│   │   │   └── reportes/
│   │   └── features/
│   │
│   ├── api/                        # NestJS — backend principal (monolito modular)
│   │   └── src/
│   │       ├── modules/
│   │       │   ├── catalog/        # Listings, categorías, materiales, colecciones
│   │       │   ├── users/          # Usuarios, perfiles de vendedor (Ateliers), auth
│   │       │   ├── orders/         # Órdenes, pagos, payouts (integración Stripe)
│   │       │   ├── messaging/      # Conversaciones, ofertas
│   │       │   ├── moderation/     # Cola de revisión, flags, verificación de vendedores
│   │       │   ├── media/          # Subida, procesado, metadatos de imágenes
│   │       │   └── search/         # Indexación y sincronización con el motor de búsqueda
│   │       ├── common/             # Guards, interceptors, decorators, filtros de excepción
│   │       ├── graphql/            # Schema raíz, resolvers compartidos
│   │       └── main.ts
│   │
│   └── workers/                    # Procesos en segundo plano (BullMQ)
│       └── src/
│           ├── jobs/
│           │   ├── process-image.job.ts
│           │   ├── index-listing.job.ts
│           │   ├── send-email.job.ts
│           │   └── release-payout.job.ts
│           └── main.ts
│
├── packages/
│   ├── ui/                         # Sistema de diseño propio (ver DESIGN_PRINCIPLES.md)
│   │   ├── components/             # Nombrados por dominio: PieceCard, AtelierBadge, ProvenanceTag...
│   │   ├── tokens/                 # Paleta, tipografía, espaciado, breakpoints
│   │   └── primitives/             # Envoltorios sobre Radix UI
│   ├── database/                   # Esquema Prisma + cliente generado + seeds
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── types/                      # Tipos de dominio compartidos (DTOs, enums)
│   ├── config/                     # tsconfig base, eslint, prettier, tailwind config compartidos
│   └── utils/                      # Helpers puros sin dependencias de framework
│
├── infrastructure/
│   ├── terraform/                  # IaC para AWS (cuando se migre desde Render/Railway)
│   └── docker/
│       ├── api.Dockerfile
│       └── workers.Dockerfile
│
├── docs/                           # ADRs (Architecture Decision Records) y documentación técnica ampliada
│
├── .github/
│   └── workflows/
│       ├── ci.yml                  # lint + typecheck + test + build en cada PR
│       └── deploy.yml
│
├── ARCHITECTURE.md
├── PROJECT_STRUCTURE.md
├── DATABASE_OVERVIEW.md
├── BUSINESS_RULES.md
├── ROADMAP.md
├── DESIGN_PRINCIPLES.md
├── DEVELOPMENT_RULES.md
├── turbo.json
└── package.json
```

## 2. Convenciones

### 2.1 Organización por feature, no por tipo de archivo

Dentro de cada app, el código se agrupa por **dominio/feature** (`catalog/`, `messaging/`, `checkout/`), no por tipo técnico (`components/`, `hooks/`, `services/` a nivel raíz). Razón: en un dominio con módulos tan diferenciados (catálogo, mensajería, pagos, moderación), agrupar por tipo técnico obliga a saltar entre carpetas lejanas para entender una sola funcionalidad; agrupar por feature mantiene junto todo lo que cambia junto.

### 2.2 Nomenclatura

- **Componentes de UI de dominio**: nombrados por el vocabulario del negocio, nunca genéricos. `PieceCard`, no `ProductCard`. `AtelierProfile`, no `SellerDashboard`. `ProvenanceTimeline`, no `HistoryList`. Esto no es solo estético: refuerza en el propio código que este no es un e-commerce genérico.
- **Archivos**: `kebab-case` para archivos, `PascalCase` para componentes React, `camelCase` para funciones/variables, `UPPER_SNAKE_CASE` para constantes globales.
- **Módulos NestJS**: un módulo por subdominio (`catalog.module.ts`), con sus propios `*.controller.ts` (si aplica), `*.resolver.ts`, `*.service.ts`, `*.repository.ts` y `dto/`.
- **GraphQL**: nombres de tipos y campos en `camelCase`, alineados 1:1 con los tipos generados en `packages/types` vía codegen — nunca se escriben tipos de API a mano en el frontend.

### 2.3 Separación Frontend / Backend

- El frontend **nunca** accede directamente a la base de datos, al object storage ni a Stripe: todo pasa por el gateway GraphQL de `apps/api`.
- `apps/web` y `apps/admin` son consumidores del mismo contrato de API, pero **no comparten componentes de UI que impliquen lógica de negocio distinta**: comparten primitivos y tokens vía `packages/ui`, pero cada app construye sus propias vistas (el panel de moderación no es "la tienda con un tema oscuro").
- La lógica de negocio (cálculo de comisión, reglas de moderación, validación de disponibilidad) vive exclusivamente en `apps/api`. El frontend nunca reimplementa reglas de negocio para "mostrar algo más rápido"; en su lugar, la API expone lo necesario para que la UI sea reactiva sin duplicar reglas.

### 2.4 Módulos del backend: un límite = un futuro microservicio

Cada carpeta bajo `apps/api/src/modules/` se trata como si algún día fuera a vivir en su propio repositorio: no importa directamente el `repository` interno de otro módulo, se comunica a través de su `service` público. Esta disciplina es la que permite que la promesa de "monolito modular → microservicios cuando haga falta" (ARCHITECTURE.md §2.1) sea real y no aspiracional.

### 2.5 Tests

Los tests viven junto al código que prueban (`*.spec.ts` junto a `*.service.ts`), salvo los end-to-end de Playwright, que viven en `apps/web/e2e/` y `apps/admin/e2e/` porque cruzan múltiples features.
