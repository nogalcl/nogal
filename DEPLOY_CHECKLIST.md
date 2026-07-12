# Checklist de lanzamiento — Nogal

## 1. Cuentas necesarias (crear antes de desplegar)

- [ ] Cloudflare (R2) — bucket `nogal-media`, API Token con permisos de lectura/escritura
- [ ] Resend — API Key, dominio de envío verificado (o usar el de prueba `resend.dev` al inicio)
- [ ] Neon (Postgres administrado) — proyecto + connection string
- [ ] Railway o Render — cuenta para hospedar `apps/api`
- [ ] Vercel — cuenta conectada al repo de GitHub, para `apps/web`
- [ ] Stripe — cuenta para generar Payment Links manuales (no requiere integración de código por ahora)
- [ ] GitHub — repositorio remoto (el proyecto todavía no tiene ninguno)

## 2. Variables de entorno — `apps/api`

| Variable                                                                                       | Valor en producción                                       |
| ---------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `DATABASE_URL`                                                                                 | connection string de Neon                                 |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`                                                     | generar con `openssl rand -base64 48`, distintos entre sí |
| `WEB_APP_URL`                                                                                  | URL pública de Vercel (o dominio propio)                  |
| `API_URL`                                                                                      | URL pública del backend en Railway/Render                 |
| `STORAGE_PROVIDER`                                                                             | `r2`                                                      |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL` | de la cuenta de Cloudflare R2                             |
| `MAIL_PROVIDER`                                                                                | `resend`                                                  |
| `RESEND_API_KEY`                                                                               | de Resend                                                 |
| `MAIL_FROM`                                                                                    | `Nogal <hola@tu-dominio>` (verificado en Resend)          |

## 3. Variables de entorno — `apps/web`

| Variable                    | Valor en producción                          |
| --------------------------- | -------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`      | dominio público del frontend                 |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | correo de contacto real                      |
| `API_URL`                   | `https://.../graphql` del backend desplegado |
| `JWT_ACCESS_SECRET`         | idéntico al de `apps/api`                    |

## 4. Base de datos

- [ ] Aplicar migraciones contra la base de Neon: `prisma migrate deploy`
- [ ] Decidir si se siembra con datos demo (`prisma/seed.ts`) o se parte vacío — para un lanzamiento real, probablemente vacío salvo taxonomía base (materiales, estilos, países, etc.) y Tendencias.

## 5. Pendiente confirmado (no bloquea el lanzamiento suave)

- Stripe Connect (pagos dentro de la plataforma) — v2, reemplaza el flujo manual de Payment Links.
- Revisión legal real de Términos y Privacidad (hoy son un borrador razonable, no reemplazan asesoría legal).
- IA de valoración — sigue sin implementar, el flujo humano ya cubre Valoración Express.

## 6. Verificación final antes de anunciar

- [ ] Smoke test en producción: registro, login, publicar una pieza con foto, enviar un mensaje, solicitar Valoración Express.
- [ ] Confirmar que las páginas `/legal/*`, `/sobre-nogal`, `/contacto` reflejan datos reales (correo de contacto).
- [ ] Confirmar favicon/logo cargando correctamente en el dominio final.
