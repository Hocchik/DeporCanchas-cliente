import { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { registerSchema } from "@/lib/validators/auth";
import { hashPassword } from "@/lib/auth/password";
import { signSession, setSessionCookie } from "@/lib/auth/session";
import { createServiceClient } from "@/lib/supabase/server";
import { sendVerificacion } from "@/lib/email/sendVerificacion";

const VERIF_TTL_MIN = 60 * 24; // 24h

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

  // Intenta crear el usuario con email_verificado=false. Si la columna no
  // existe (no se corrió el SQL aún), reintenta sin ella — el usuario quedará
  // tratado como verificado por defecto en el flujo.
  let createRes = await supabase
    .from("usuarios")
    .insert({
      nombre,
      email,
      dni,
      celular: celular || null,
      clave_hash,
      roles_id: rolCliente.id,
      email_verificado: false,
    })
    .select("id, email, nombre, dni, celular, roles_id")
    .single();
  if (createRes.error && /email_verificado/i.test(createRes.error.message || "")) {
    createRes = await supabase
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
  }
  const { data: created, error } = createRes;

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

  // Generar token de verificación y mandar email. Si la tabla no existe o el
  // email falla, lo logueamos pero NO tumbamos el registro — el usuario puede
  // pedir el reenvío desde el banner del navbar.
  try {
    const verifToken = randomBytes(32).toString("hex");
    const expira_en = new Date(Date.now() + VERIF_TTL_MIN * 60 * 1000).toISOString();
    const { error: vErr } = await supabase
      .from("verificacion_email")
      .insert({ usuarios_id: created.id, token: verifToken, expira_en });
    if (vErr) {
      console.error("verificacion_email insert failed", vErr);
    } else {
      const origin =
        process.env.NEXT_PUBLIC_APP_URL ||
        req.headers.get("origin") ||
        `https://${req.headers.get("host") ?? "localhost:3000"}`;
      try {
        await sendVerificacion({
          to: created.email,
          cliente: created.nombre,
          link: `${origin}/verificar?token=${verifToken}`,
          expiraMin: VERIF_TTL_MIN,
        });
      } catch (e) {
        console.error("verificacion_email send failed", e);
      }
    }
  } catch (e) {
    console.error("verificacion bloque error", e);
  }

  const token = await signSession({ uid: created.id, rid: created.roles_id });
  await setSessionCookie(token);

  return Response.json({ user: created }, { status: 201 });
}
