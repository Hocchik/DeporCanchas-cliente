import { NextRequest } from "next/server";
import { requireUser, UnauthorizedError, unauthorizedResponse } from "@/lib/auth/requireUser";
import { createServiceClient } from "@/lib/supabase/server";
import { cambiarClaveSchema } from "@/lib/validators/perfil";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

export const runtime = "nodejs";

export async function PATCH(req: NextRequest) {
  let user;
  try { user = await requireUser(); }
  catch (e) { if (e instanceof UnauthorizedError) return unauthorizedResponse(); throw e; }

  const body = await req.json().catch(() => null);
  const parsed = cambiarClaveSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "validation", issues: parsed.error.issues }, { status: 400 });
  }
  const { clave_actual, clave_nueva } = parsed.data;

  const supabase = createServiceClient();
  const { data: row } = await supabase.from("usuarios").select("clave_hash").eq("id", user.id).single();
  if (!row) return Response.json({ error: "usuario_no_encontrado" }, { status: 404 });

  const ok = await verifyPassword(clave_actual, row.clave_hash);
  if (!ok) return Response.json({ error: "clave_actual_invalida" }, { status: 401 });

  const nuevaHash = await hashPassword(clave_nueva);
  const { error } = await supabase
    .from("usuarios")
    .update({ clave_hash: nuevaHash, actualizado_en: new Date().toISOString() })
    .eq("id", user.id);
  if (error) return Response.json({ error: "update_failed", detail: error.message }, { status: 500 });

  return Response.json({ ok: true });
}
