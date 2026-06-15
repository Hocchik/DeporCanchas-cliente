import "server-only";
import { SignJWT, jwtVerify } from "jose";

/**
 * Reset token de un solo uso para el flujo "olvidé mi contraseña".
 *
 * Se emite cuando el cliente verifica correctamente el código de 6 dígitos.
 * Sirve para que la siguiente llamada (POST /api/auth/restablecer) sepa qué
 * usuario está reseteando su clave sin pedir de nuevo el código. Vive 10 min.
 *
 * Payload: { uid (usuarios.id), rid (recuperacion_clave.id) }.
 * Firmado con JWT_SECRET (la misma firma de sesión, distinto alg/payload).
 */

const ALG = "HS256";
const TTL_SECONDS = 10 * 60;

export type ResetTokenPayload = {
  uid: number;
  rid: number;
};

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET no está definido");
  return new TextEncoder().encode(secret);
}

export async function signResetToken(payload: ResetTokenPayload): Promise<string> {
  return await new SignJWT({ uid: payload.uid, rid: payload.rid, kind: "reset" })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(`${TTL_SECONDS}s`)
    .sign(getSecret());
}

export async function verifyResetToken(token: string): Promise<ResetTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: [ALG] });
    if (payload.kind !== "reset") return null;
    if (typeof payload.uid !== "number" || typeof payload.rid !== "number") return null;
    return { uid: payload.uid, rid: payload.rid };
  } catch {
    return null;
  }
}
