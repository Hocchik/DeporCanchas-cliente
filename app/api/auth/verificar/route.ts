import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * POST /api/auth/verificar { token }
 * Valida el token de verificación de email y marca al usuario como verificado.
 * Idempotente en sentido: si ya estaba verificado y el token sigue válido, OK.
 */
export async function POST(req: NextRequest) {
  let body: { token?: string } = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }
  const token = (body.token ?? "").toString();
  if (!token || token.length < 32) {
    return Response.json({ error: "token_invalido" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: row } = await supabase
    .from("verificacion_email")
    .select("id, usuarios_id, usado_en, expira_en")
    .eq("token", token)
    .maybeSingle();

  if (!row) return Response.json({ error: "token_invalido" }, { status: 400 });
  if (new Date(row.expira_en).getTime() < Date.now()) {
    return Response.json({ error: "token_vencido" }, { status: 400 });
  }
  // Si ya fue usado, igual respondemos ok — el usuario quedó verificado en su momento.
  if (row.usado_en) return Response.json({ ok: true, already: true });

  const { error: updErr } = await supabase
    .from("usuarios")
    .update({ email_verificado: true })
    .eq("id", row.usuarios_id);
  if (updErr) {
    return Response.json({ error: "update_failed", detail: updErr.message }, { status: 500 });
  }
  await supabase
    .from("verificacion_email")
    .update({ usado_en: new Date().toISOString() })
    .eq("id", row.id);

  return Response.json({ ok: true });
}
