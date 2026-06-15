import { NextRequest } from "next/server";
import { randomInt } from "crypto";
import { createServiceClient } from "@/lib/supabase/server";
import { sendRecuperacion } from "@/lib/email/sendRecuperacion";

export const runtime = "nodejs";

const CODE_TTL_MIN = 10;
const RESEND_COOLDOWN_MS = 60 * 1000; // 1 minuto entre reenvíos
const MAX_PER_WINDOW = 5;             // máx envíos por ventana
const WINDOW_MS = 15 * 60 * 1000;     // ventana de 15 min

// Cooldown / rate-limit en memoria por email. Sirve para impedir spam de
// solicitudes desde el mismo formulario; no es perfecto (se resetea con
// cada reinicio del proceso) pero es suficiente para el alcance del proyecto.
const senders = new Map<string, { lastSentAt: number; countInWindow: number; windowStart: number }>();

function genCode6(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

/**
 * POST /api/auth/recuperar { email }
 *
 * Genera un código de 6 dígitos válido por 10 min y lo manda al email
 * indicado vía SMTP (Gmail en .env). Invalida los códigos previos no
 * usados del mismo usuario para que solo el último sea válido.
 *
 * Por privacidad NO revela si el email existe: siempre responde 200 OK
 * con `{ ok: true, cooldown_until }`. Si está bajo cooldown / rate-limit
 * devuelve 429 para que la UI muestre el contador.
 */
export async function POST(req: NextRequest) {
  let body: { email?: string } = {};
  try {
    body = await req.json();
  } catch {}
  const email = (body.email ?? "").toString().trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    // No exponemos si el email es inválido para no dar señales.
    return Response.json({ ok: true });
  }

  // Rate-limit por email
  const now = Date.now();
  const st = senders.get(email);
  if (st) {
    // Resetear ventana si pasó
    if (now - st.windowStart > WINDOW_MS) {
      st.countInWindow = 0;
      st.windowStart = now;
    }
    if (now - st.lastSentAt < RESEND_COOLDOWN_MS) {
      const wait = Math.ceil((RESEND_COOLDOWN_MS - (now - st.lastSentAt)) / 1000);
      return Response.json({ error: "cooldown", wait_seconds: wait }, { status: 429 });
    }
    if (st.countInWindow >= MAX_PER_WINDOW) {
      return Response.json({ error: "demasiados_intentos", wait_seconds: Math.ceil((WINDOW_MS - (now - st.windowStart)) / 1000) }, { status: 429 });
    }
  }

  const supabase = createServiceClient();
  const { data: user, error: userErr } = await supabase
    .from("usuarios")
    .select("id, nombre, email, esta_activo")
    .eq("email", email)
    .maybeSingle();

  if (userErr) {
    console.error(`[recuperar] usuarios select falló para ${email}:`, userErr.message);
  }

  // Actualizar contadores aunque el usuario no exista (consistencia anti-enumeración).
  senders.set(email, {
    lastSentAt: now,
    countInWindow: (st?.countInWindow ?? 0) + 1,
    windowStart: st?.windowStart ?? now,
  });

  if (!user) {
    console.warn(`[recuperar] no hay usuario con email=${email} — respondiendo ok silencioso`);
    return Response.json({ ok: true, cooldown_seconds: RESEND_COOLDOWN_MS / 1000 });
  }
  if (!user.esta_activo) {
    console.warn(`[recuperar] usuario ${email} está inactivo (esta_activo=false) — no enviamos código`);
    return Response.json({ ok: true, cooldown_seconds: RESEND_COOLDOWN_MS / 1000 });
  }

  // Invalidar códigos previos no usados del mismo usuario
  const { error: invErr } = await supabase
    .from("recuperacion_clave")
    .update({ usado_en: new Date().toISOString() })
    .eq("usuarios_id", user.id)
    .is("usado_en", null);
  if (invErr) {
    console.error(`[recuperar] no se pudieron invalidar códigos previos:`, invErr.message);
  }

  // Generar nuevo código y guardarlo
  const code = genCode6();
  const expira_en = new Date(now + CODE_TTL_MIN * 60 * 1000).toISOString();
  const { error: insErr } = await supabase
    .from("recuperacion_clave")
    .insert({ usuarios_id: user.id, token: code, expira_en });
  if (insErr) {
    console.error(
      `[recuperar] insert en recuperacion_clave falló (¿tabla creada? ¿columnas usuarios_id/token/expira_en/usado_en?):`,
      insErr.message,
    );
    return Response.json({ ok: true });
  }

  console.log(`[recuperar] código generado para ${email}; enviando SMTP…`);

  // Enviar email — no bloquea la respuesta si el SMTP falla.
  try {
    await sendRecuperacion({
      to: user.email,
      cliente: user.nombre,
      codigo: code,
      expiraMin: CODE_TTL_MIN,
    });
    console.log(`[recuperar] email enviado a ${email}`);
  } catch (e) {
    console.error(
      `[recuperar] sendRecuperacion falló para ${email}:`,
      e instanceof Error ? e.message : e,
    );
  }

  return Response.json({ ok: true, cooldown_seconds: RESEND_COOLDOWN_MS / 1000 });
}
