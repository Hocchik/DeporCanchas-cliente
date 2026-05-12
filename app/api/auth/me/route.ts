import { getCurrentUser } from "@/lib/auth/requireUser";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  return Response.json({ user });
}
