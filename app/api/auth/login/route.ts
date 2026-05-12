import { NextRequest } from "next/server";
import { loginSchema } from "@/lib/validators/auth";
import { verifyPassword } from "@/lib/auth/password";
import { signSession, setSessionCookie } from "@/lib/auth/session";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 1000;

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_ATTEMPTS) return false;
  entry.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (!rateLimit(ip)) {
    return Response.json({ error: "too_many_attempts" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "validation", issues: parsed.error.issues }, { status: 400 });
  }
  const { email, clave } = parsed.data;

  const supabase = createServiceClient();
  const { data: user } = await supabase
    .from("usuarios")
    .select("id, email, nombre, dni, celular, roles_id, clave_hash, esta_activo")
    .eq("email", email)
    .maybeSingle();

  if (!user || !user.esta_activo) {
    return Response.json({ error: "credenciales_invalidas" }, { status: 401 });
  }

  const ok = await verifyPassword(clave, user.clave_hash);
  if (!ok) {
    return Response.json({ error: "credenciales_invalidas" }, { status: 401 });
  }

  const token = await signSession({ uid: user.id, rid: user.roles_id });
  await setSessionCookie(token);

  const { clave_hash: _clave_hash, esta_activo: _esta_activo, ...publicUser } = user;
  return Response.json({ user: publicUser });
}
