import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { hashPassword } from "@/lib/auth/password";

export const runtime = "nodejs";

/**
 * POST /api/auth/restablecer { token, password }
 * Verifica el token (existe, no usado, no vencido), hashea la nueva clave,
 * actualiza usuarios.clave_hash y marca el token como usado.
 */
export async function POST(req: NextRequest) {
  let body: { token?: string; password?: string } = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }
  const token = (body.token ?? "").toString();
  const password = (body.password ?? "").toString();

  if (!token || token.length < 32) {
    return Response.json({ error: "token_invalido" }, { status: 400 });
  }
  if (password.length < 8) {
    return Response.json({ error: "password_corta", detail: "Mínimo 8 caracteres." }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: row } = await supabase
    .from("recuperacion_clave")
    .select("id, usuarios_id, usado_en, expira_en")
    .eq("token", token)
    .maybeSingle();

  if (!row) return Response.json({ error: "token_invalido" }, { status: 400 });
  if (row.usado_en) return Response.json({ error: "token_usado" }, { status: 400 });
  if (new Date(row.expira_en).getTime() < Date.now()) {
    return Response.json({ error: "token_vencido" }, { status: 400 });
  }

  const clave_hash = await hashPassword(password);
  const { error: updErr } = await supabase
    .from("usuarios")
    .update({ clave_hash })
    .eq("id", row.usuarios_id);
  if (updErr) {
    return Response.json({ error: "update_failed", detail: updErr.message }, { status: 500 });
  }

  // Marcar token como usado (idempotente: si se intenta de nuevo, falla en `usado_en`).
  await supabase
    .from("recuperacion_clave")
    .update({ usado_en: new Date().toISOString() })
    .eq("id", row.id);

  return Response.json({ ok: true });
}
