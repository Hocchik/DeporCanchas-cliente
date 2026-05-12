import "server-only";
import { getSessionFromCookies } from "./session";
import { createServiceClient } from "../supabase/server";

export type AuthenticatedUser = {
  id: number;
  email: string;
  nombre: string;
  dni: string | null;
  celular: string | null;
  roles_id: number;
};

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const session = await getSessionFromCookies();
  if (!session) return null;
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("usuarios")
    .select("id, email, nombre, dni, celular, roles_id, esta_activo")
    .eq("id", session.uid)
    .single();
  if (error || !data || !data.esta_activo) return null;
  const { esta_activo: _esta_activo, ...user } = data;
  return user as AuthenticatedUser;
}

export async function requireUser(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  return user;
}

export function unauthorizedResponse(): Response {
  return Response.json({ error: "unauthorized" }, { status: 401 });
}
