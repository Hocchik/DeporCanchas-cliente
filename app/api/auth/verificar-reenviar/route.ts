import { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { requireUser, UnauthorizedError, unauthorizedResponse } from "@/lib/auth/requireUser";
import { createServiceClient } from "@/lib/supabase/server";
import { sendVerificacion } from "@/lib/email/sendVerificacion";

export const runtime = "nodejs";

const TTL_MIN = 60 * 24;

/**
 * POST /api/auth/verificar-reenviar
 * Reenvía el correo de verificación al usuario logueado. Útil para los que
 * perdieron el correo de registro o el token vencido. Siempre devuelve ok=true
 * (no exponemos si ya está verificado o no — el cliente lo sabe por /me).
 */
export async function POST(_req: NextRequest) {
  let user;
  try {
    user = await requireUser();
  } catch (e) {
    if (e instanceof UnauthorizedError) return unauthorizedResponse();
    throw e;
  }

  // Si ya está verificado, devolvemos ok sin mandar nada.
  if (user.emailVerificado) return Response.json({ ok: true, already: true });

  const supabase = createServiceClient();
  const token = randomBytes(32).toString("hex");
  const expira_en = new Date(Date.now() + TTL_MIN * 60 * 1000).toISOString();
  const { error: insErr } = await supabase
    .from("verificacion_email")
    .insert({ usuarios_id: user.id, token, expira_en });
  if (insErr) {
    console.error("verificar-reenviar insert failed", insErr);
    return Response.json({ ok: false, error: "internal" }, { status: 500 });
  }

  const origin =
    process.env.NEXT_PUBLIC_APP_URL ||
    _req.headers.get("origin") ||
    `https://${_req.headers.get("host") ?? "localhost:3000"}`;
  try {
    await sendVerificacion({
      to: user.email,
      cliente: user.nombre,
      link: `${origin}/verificar?token=${token}`,
      expiraMin: TTL_MIN,
    });
  } catch (e) {
    console.error("verificar-reenviar send failed", e);
    return Response.json({ ok: false, error: "email_failed" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
