import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { hashPassword } from "@/lib/auth/password";
import { verifyResetToken } from "@/lib/auth/resetToken";

export const runtime = "nodejs";

/**
 * POST /api/auth/restablecer { reset_token, password }
 *
 * `reset_token` viene del paso `POST /api/auth/recuperar/verificar` (JWT 10
 * min). Hashea la nueva clave, actualiza `usuarios.clave_hash` y marca la
 * fila de `recuperacion_clave` como usada. Si el token es viejo o el
 * registro ya fue consumido devuelve 400.
 */
export async function POST(req: NextRequest) {
  let body: { reset_token?: string; password?: string } = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }
  const reset_token = (body.reset_token ?? "").toString();
  const password = (body.password ?? "").toString();

  if (!reset_token) {
    return Response.json({ error: "token_invalido" }, { status: 400 });
  }
  if (password.length < 8) {
    return Response.json({ error: "password_corta", detail: "Mínimo 8 caracteres." }, { status: 400 });
  }

  const payload = await verifyResetToken(reset_token);
  if (!payload) {
    return Response.json({ error: "token_invalido" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Validar que la fila siga vigente (no usada). Si ya está usada → 400.
  const { data: row } = await supabase
    .from("recuperacion_clave")
    .select("id, usuarios_id, usado_en, expira_en")
    .eq("id", payload.rid)
    .maybeSingle();

  if (!row || row.usuarios_id !== payload.uid) {
    return Response.json({ error: "token_invalido" }, { status: 400 });
  }
  if (row.usado_en) {
    return Response.json({ error: "token_usado" }, { status: 400 });
  }
  if (new Date(row.expira_en).getTime() < Date.now()) {
    return Response.json({ error: "token_vencido" }, { status: 400 });
  }

  const clave_hash = await hashPassword(password);
  const { error: updErr } = await supabase
    .from("usuarios")
    .update({ clave_hash })
    .eq("id", payload.uid);
  if (updErr) {
    return Response.json({ error: "update_failed", detail: updErr.message }, { status: 500 });
  }

  await supabase
    .from("recuperacion_clave")
    .update({ usado_en: new Date().toISOString() })
    .eq("id", payload.rid);

  return Response.json({ ok: true });
}
