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
  /** true si el usuario ya verificó su email vía el link enviado al registrarse. */
  emailVerificado: boolean;
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
  // Intenta traer email_verificado; si la columna aún no existe en BD (no se
  // corrió el SQL), reintenta sin ella y asume verificado=true (legacy).
  let { data, error } = await supabase
    .from("usuarios")
    .select("id, email, nombre, dni, celular, roles_id, esta_activo, email_verificado")
    .eq("id", session.uid)
    .single();
  if (error) {
    const fb = await supabase
      .from("usuarios")
      .select("id, email, nombre, dni, celular, roles_id, esta_activo")
      .eq("id", session.uid)
      .single();
    if (fb.error || !fb.data || !fb.data.esta_activo) return null;
    data = { ...fb.data, email_verificado: true } as any;
  }
  if (!data || !data.esta_activo) return null;
  const { esta_activo: _esta_activo, email_verificado, ...rest } = data as any;
  return { ...rest, emailVerificado: !!email_verificado } as AuthenticatedUser;
}

export async function requireUser(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  return user;
}

export function unauthorizedResponse(): Response {
  return Response.json({ error: "unauthorized" }, { status: 401 });
}
