import { NextRequest } from "next/server";
import { registerSchema } from "@/lib/validators/auth";
import { hashPassword } from "@/lib/auth/password";
import { signSession, setSessionCookie } from "@/lib/auth/session";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "validation", issues: parsed.error.issues }, { status: 400 });
  }
  const { nombre, email, dni, celular, clave } = parsed.data;

  const supabase = createServiceClient();

  const { data: rolCliente } = await supabase
    .from("roles")
    .select("id")
    .eq("nombre", "cliente")
    .single();
  if (!rolCliente) {
    return Response.json({ error: "rol_no_encontrado" }, { status: 500 });
  }

  const { data: existing } = await supabase
    .from("usuarios")
    .select("id")
    .or(`email.eq.${email},dni.eq.${dni}`)
    .maybeSingle();
  if (existing) {
    return Response.json({ error: "usuario_ya_existe" }, { status: 409 });
  }

  const clave_hash = await hashPassword(clave);

  const { data: created, error } = await supabase
    .from("usuarios")
    .insert({
      nombre,
      email,
      dni,
      celular: celular || null,
      clave_hash,
      roles_id: rolCliente.id,
    })
    .select("id, email, nombre, dni, celular, roles_id")
    .single();

  if (error || !created) {
    return Response.json({ error: "insert_failed", detail: error?.message }, { status: 500 });
  }

  const token = await signSession({ uid: created.id, rid: created.roles_id });
  await setSessionCookie(token);

  return Response.json({ user: created }, { status: 201 });
}
