# DeporCanchas — Vista Web (Cliente)

Sistema web de reservas de canchas deportivas para DeporCanchas Lima S.A.C.

**Stack:** Next.js 16 + React 19 + TypeScript + Tailwind 4 + Supabase + Resend + bcryptjs + jose + zod + @vercel/og.

## Setup

1. Copiar `.env.local.example` → `.env.local` y rellenar todas las variables.
2. Crear proyecto Supabase nuevo y ejecutar el SQL del spec (sección 4): `docs/superpowers/specs/2026-05-11-reservas-deporcanchas-design.md`.
3. Crear cuenta Resend, generar API key.
4. `pnpm install`.
5. `pnpm dev` → http://localhost:3000.

## Estructura

- `app/` — páginas (App Router) y route handlers (`app/api/*`).
- `lib/` — auth (bcrypt + JWT), supabase (public/server), voucher, email, validators.
- `docs/superpowers/` — spec y plan de implementación (en el repo padre).

## Endpoints API

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/reservas
GET    /api/reservas/by-code/[code]
GET    /api/reservas/mias?filter=proximas|pasadas|canceladas
POST   /api/reservas/[id]/cancelar
POST   /api/pagos                    (multipart si yape)
GET    /api/perfil
PATCH  /api/perfil
PATCH  /api/perfil/clave
GET    /api/cron/recordatorios       (Bearer CRON_SECRET)
```

## Despliegue

Vercel. Configurar todas las env vars en el dashboard. El cron diario (`vercel.json`) corre automáticamente.

## Notas operativas

- **Auth custom** (no Supabase Auth). Claves bcrypt, sesión JWT en cookie httpOnly 7 días.
- **Hold de reservas: 10 min** antes de expirar y liberar el slot. Constraint `EXCLUDE` en BD impide solapes.
- **Cancelación:** solo con >24h de anticipación.
- **Pagos simulados** (`pagos.simulated = true`). Tarjeta y Yape/Plin con QR + comprobante.
- **Vouchers:** PNG generado con `@vercel/og`, guardado en bucket Storage `vouchers` (público). Sin validez legal.
- **Email** vía Resend (confirmación al pagar + recordatorio 24h antes via Vercel Cron 17:00 hora Lima).
