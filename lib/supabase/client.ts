// Compat shim: el código viejo llamaba createClient({ persistSession }).
// El nuevo cliente no necesita opciones de auth (auth deja de ser Supabase Auth).
// Será removido cuando todos los usos se actualicen.
import { createPublicClient } from "./public";

export function createClient(_options?: { persistSession?: boolean }) {
  return createPublicClient();
}
