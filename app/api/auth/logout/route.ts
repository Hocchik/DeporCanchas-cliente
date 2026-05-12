import { clearSessionCookie } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST() {
  await clearSessionCookie();
  return new Response(null, { status: 204 });
}
