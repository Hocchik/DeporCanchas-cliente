import { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { createServiceClient } from "@/lib/supabase/server";
import { sendRecuperacion } from "@/lib/email/sendRecuperacion";

export const runtime = "nodejs";

const TTL_MIN = 30;

/**
 * POST /api/auth/recuperar { email }
 * Genera un token de un solo uso (32 bytes hex, 30 min de vida) y manda un
 * email con el link al usuario con ese email. **Siempre** devuelve éxito para
 * no exponer si un email está registrado (anti-enumeración).
 */
export async function POST(req: NextRequest) {
  let body: { email?: string } = {};
  try {
    body = await req.json();
  } catch {}
  const email = (body.email ?? "").toString().trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ ok: true }); // disimulo: no decimos "email inválido"
  }

  const supabase = createServiceClient();
  const { data: user } = await supabase
    .from("usuarios")
    .select("id, nombre, email, esta_activo")
    .eq("email", email)
    .maybeSingle();

  // Si no existe o está inactivo, simulamos éxito sin mandar nada.
  if (!user || !user.esta_activo) return Response.json({ ok: true });

  // Generar token y guardarlo
  const token = randomBytes(32).toString("hex");
  const expira_en = new Date(Date.now() + TTL_MIN * 60 * 1000).toISOString();
  const { error: insErr } = await supabase
    .from("recuperacion_clave")
    .insert({ usuarios_id: user.id, token, expira_en });
  if (insErr) {
    // No expongas detalle interno; logueamos.
    console.error("recuperar insert failed", insErr);
    return Response.json({ ok: true });
  }

  // Armar link absoluto. Preferir env; si no, derivar del header.
  const origin =
    process.env.NEXT_PUBLIC_APP_URL ||
    req.headers.get("origin") ||
    `https://${req.headers.get("host") ?? "localhost:3000"}`;
  const link = `${origin}/restablecer?token=${token}`;

  // Enviar email (no bloquea si falla, pero logueamos)
  try {
    await sendRecuperacion({
      to: user.email,
      cliente: user.nombre,
      link,
      expiraMin: TTL_MIN,
    });
  } catch (e) {
    console.error("recuperar email failed", e);
  }

  return Response.json({ ok: true });
}
