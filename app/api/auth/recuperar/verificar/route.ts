import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { signResetToken } from "@/lib/auth/resetToken";

export const runtime = "nodejs";

const MAX_ATTEMPTS = 5;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;

// Tracking de intentos fallidos por email para limitar fuerza bruta sobre el
// código de 6 dígitos. 5 fallos en 15 min → 423 (locked).
const wrongAttempts = new Map<string, { count: number; windowStart: number }>();

function recordFail(email: string): number {
  const now = Date.now();
  const st = wrongAttempts.get(email);
  if (!st || now - st.windowStart > ATTEMPT_WINDOW_MS) {
    wrongAttempts.set(email, { count: 1, windowStart: now });
    return 1;
  }
  st.count += 1;
  return st.count;
}

function resetFail(email: string) {
  wrongAttempts.delete(email);
}

function isLocked(email: string): boolean {
  const st = wrongAttempts.get(email);
  if (!st) return false;
  if (Date.now() - st.windowStart > ATTEMPT_WINDOW_MS) {
    wrongAttempts.delete(email);
    return false;
  }
  return st.count >= MAX_ATTEMPTS;
}

/**
 * POST /api/auth/recuperar/verificar { email, codigo }
 *
 * Valida que el código de 6 dígitos coincida con un registro vigente de
 * `recuperacion_clave` para ese email. Si pasa, responde un `reset_token`
 * (JWT 10 min) que el siguiente paso usa para fijar la nueva contraseña.
 */
export async function POST(req: NextRequest) {
  let body: { email?: string; codigo?: string } = {};
  try { body = await req.json(); } catch {}

  const email = (body.email ?? "").toString().trim().toLowerCase();
  const codigo = (body.codigo ?? "").toString().trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{6}$/.test(codigo)) {
    return Response.json({ error: "datos_invalidos" }, { status: 400 });
  }

  if (isLocked(email)) {
    return Response.json({ error: "demasiados_intentos" }, { status: 429 });
  }

  const supabase = createServiceClient();
  const { data: user } = await supabase
    .from("usuarios")
    .select("id, esta_activo")
    .eq("email", email)
    .maybeSingle();

  // Por anti-enumeración devolvemos siempre el mismo error si no existe.
  if (!user || !user.esta_activo) {
    recordFail(email);
    return Response.json({ error: "codigo_invalido" }, { status: 400 });
  }

  const { data: row } = await supabase
    .from("recuperacion_clave")
    .select("id, token, usado_en, expira_en")
    .eq("usuarios_id", user.id)
    .is("usado_en", null)
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!row) {
    recordFail(email);
    return Response.json({ error: "codigo_invalido" }, { status: 400 });
  }
  if (new Date(row.expira_en).getTime() < Date.now()) {
    return Response.json({ error: "codigo_vencido" }, { status: 400 });
  }
  if (row.token !== codigo) {
    const fails = recordFail(email);
    return Response.json({
      error: "codigo_invalido",
      intentos_restantes: Math.max(0, MAX_ATTEMPTS - fails),
    }, { status: 400 });
  }

  resetFail(email);
  const reset_token = await signResetToken({ uid: user.id, rid: row.id });
  return Response.json({ ok: true, reset_token });
}
