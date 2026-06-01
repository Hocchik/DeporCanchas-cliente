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
    // Devolvemos también un mensaje legible (primer issue) para que la UI lo muestre directo
    const first = parsed.error.issues[0];
    const field = first?.path?.join(".") || "";
    const detail = field ? `${field}: ${first?.message}` : first?.message;
    return Response.json({ error: "validation", detail, issues: parsed.error.issues }, { status: 400 });
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

  const { data: emailExists } = await supabase
    .from("usuarios")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (emailExists) {
    return Response.json({ error: "usuario_ya_existe" }, { status: 409 });
  }

  const { data: dniExists } = await supabase
    .from("usuarios")
    .select("id")
    .eq("dni", dni)
    .maybeSingle();
  if (dniExists) {
    return Response.json({ error: "dni_ya_existe" }, { status: 409 });
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
    const errAny = error as { code?: string; message?: string; details?: string } | null;
    // Violación de UNIQUE: identificamos por columna en el mensaje de Postgres
    if (errAny?.code === "23505") {
      const m = (errAny.message || "").toLowerCase();
      if (m.includes("dni")) return Response.json({ error: "dni_ya_existe", detail: errAny.message }, { status: 409 });
      if (m.includes("email")) return Response.json({ error: "usuario_ya_existe", detail: errAny.message }, { status: 409 });
      if (m.includes("celular")) return Response.json({ error: "celular_ya_existe", detail: errAny.message }, { status: 409 });
      // Constraint UNIQUE en otra columna no esperada
      return Response.json({ error: "unique_violation", detail: errAny.message }, { status: 409 });
    }
    return Response.json({ error: "insert_failed", detail: errAny?.message || errAny?.details || "sin detalle" }, { status: 500 });
  }

  const token = await signSession({ uid: created.id, rid: created.roles_id });
  await setSessionCookie(token);

  return Response.json({ user: created }, { status: 201 });
}
