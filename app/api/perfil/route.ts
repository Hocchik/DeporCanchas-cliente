import { NextRequest } from "next/server";
import { requireUser, UnauthorizedError, unauthorizedResponse } from "@/lib/auth/requireUser";
import { createServiceClient } from "@/lib/supabase/server";
import { updatePerfilSchema } from "@/lib/validators/perfil";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireUser();
    return Response.json({ user });
  } catch (e) {
    if (e instanceof UnauthorizedError) return unauthorizedResponse();
    throw e;
  }
}

export async function PATCH(req: NextRequest) {
  let user;
  try { user = await requireUser(); }
  catch (e) { if (e instanceof UnauthorizedError) return unauthorizedResponse(); throw e; }

  const body = await req.json().catch(() => null);
  const parsed = updatePerfilSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "validation", issues: parsed.error.issues }, { status: 400 });
  }
  const { nombre, email, celular } = parsed.data;

  const supabase = createServiceClient();

  if (email !== user.email) {
    const { data: dup } = await supabase.from("usuarios").select("id").eq("email", email).maybeSingle();
    if (dup) return Response.json({ error: "email_ya_usado" }, { status: 409 });
  }

  const { error } = await supabase
    .from("usuarios")
    .update({ nombre, email, celular: celular || null, actualizado_en: new Date().toISOString() })
    .eq("id", user.id);
  if (error) return Response.json({ error: "update_failed", detail: error.message }, { status: 500 });

  return Response.json({ ok: true });
}
