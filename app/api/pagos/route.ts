import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { requireUser, UnauthorizedError, unauthorizedResponse } from "@/lib/auth/requireUser";
import { createServiceClient } from "@/lib/supabase/server";
import { pagoTarjetaSchema, pagoYapeSchema, type PagoTarjetaInput } from "@/lib/validators/pago";
import { generarVoucherPng } from "@/lib/voucher/render";
import { sendConfirmacion } from "@/lib/email/sendConfirmacion";
import { formatLimaDate, formatLimaTime12, formatLimaHourRange, diffHours } from "@/lib/time";

export const runtime = "nodejs";
export const maxDuration = 30;

function deduceBrand(numero: string): string {
  if (numero.startsWith("4")) return "VISA";
  if (/^5[1-5]/.test(numero) || /^2(2[2-9]|[3-6]|7[01]|720)/.test(numero)) return "MASTERCARD";
  if (/^3[47]/.test(numero)) return "AMEX";
  return "DESCONOCIDA";
}

type ReservaConJoin = {
  id: number;
  code: string;
  estado: string;
  expires_at: string | null;
  fecha_empieza: string;
  fecha_termina: string;
  precio_total: number;
  usuarios_id: number;
  canchas_deportivas: {
    id: number;
    nombre: string;
    tipo_deporte: string;
    campus: { id: number; nombre: string; ubicacion: string };
  };
};

export async function POST(req: NextRequest) {
  let user;
  try {
    user = await requireUser();
  } catch (e) {
    if (e instanceof UnauthorizedError) return unauthorizedResponse();
    throw e;
  }

  const supabase = createServiceClient();
  const contentType = req.headers.get("content-type") ?? "";

  let metodo: "yape" | "plin" | "tarjeta";
  let reserva_code: string;
  let comprobanteFile: File | null = null;
  let cardData: PagoTarjetaInput | null = null;

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const data = {
      reserva_code: String(form.get("reserva_code") ?? ""),
      metodo_pago: String(form.get("metodo_pago") ?? "") as "yape" | "plin",
    };
    const parsed = pagoYapeSchema.safeParse(data);
    if (!parsed.success) {
      return Response.json({ error: "validation", issues: parsed.error.issues }, { status: 400 });
    }
    metodo = parsed.data.metodo_pago;
    reserva_code = parsed.data.reserva_code;
    const file = form.get("comprobante");
    if (!(file instanceof File) || file.size === 0) {
      return Response.json({ error: "comprobante_requerido" }, { status: 400 });
    }
    if (file.size > 2 * 1024 * 1024) {
      return Response.json({ error: "comprobante_muy_grande" }, { status: 400 });
    }
    comprobanteFile = file;
  } else {
    const body = await req.json();
    const parsed = pagoTarjetaSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "validation", issues: parsed.error.issues }, { status: 400 });
    }
    metodo = "tarjeta";
    reserva_code = parsed.data.reserva_code;
    cardData = parsed.data;
  }

  // Cargar reserva
  const { data: reserva } = await supabase
    .from("reservas")
    .select(
      `id, code, estado, expires_at, fecha_empieza, fecha_termina, precio_total, usuarios_id,
       canchas_deportivas (id, nombre, tipo_deporte, campus (id, nombre, ubicacion))`
    )
    .eq("code", reserva_code)
    .single<ReservaConJoin>();

  if (!reserva) return Response.json({ error: "reserva_no_encontrada" }, { status: 404 });
  if (reserva.usuarios_id !== user.id) return Response.json({ error: "forbidden" }, { status: 403 });
  if (reserva.estado !== "pendiente") return Response.json({ error: "reserva_no_pendiente" }, { status: 409 });
  if (!reserva.expires_at || new Date(reserva.expires_at) < new Date()) {
    return Response.json({ error: "reserva_expirada" }, { status: 409 });
  }

  // Subir comprobante de Yape si aplica
  let comprobante_yape_url: string | null = null;
  if (comprobanteFile) {
    const ext = comprobanteFile.name.split(".").pop()?.toLowerCase() ?? "png";
    const path = `${reserva.id}-${randomUUID()}.${ext}`;
    const buf = Buffer.from(await comprobanteFile.arrayBuffer());
    const { error: upErr } = await supabase.storage
      .from("yape_comprobantes")
      .upload(path, buf, { contentType: comprobanteFile.type, upsert: false });
    if (upErr) return Response.json({ error: "upload_failed", detail: upErr.message }, { status: 500 });
    const { data: urlData } = await supabase.storage
      .from("yape_comprobantes")
      .createSignedUrl(path, 60 * 60 * 24 * 365);
    comprobante_yape_url = urlData?.signedUrl ?? null;
  }

  // Correlativo atómico vía secuencia Postgres (evita que 2 pagos concurrentes
  // tomen el mismo número y se pisen el voucher). Fallback a max+1 si la función
  // RPC aún no existe en la BD.
  let correlativo: number;
  const { data: seqVal, error: seqErr } = await supabase.rpc("next_voucher_correlativo");
  if (!seqErr && typeof seqVal === "number") {
    correlativo = seqVal;
  } else {
    const { data: rows } = await supabase
      .from("pagos")
      .select("voucher_correlativo")
      .order("voucher_correlativo", { ascending: false })
      .limit(1);
    correlativo = ((rows?.[0]?.voucher_correlativo as number | null) ?? 0) + 1;
  }

  // Insertar pago
  const insertData: Record<string, unknown> = {
    reserva_id: reserva.id,
    monto: reserva.precio_total,
    estado: "exitoso",
    metodo_pago: metodo,
    simulated: true,
    voucher_serie: "EB001",
    voucher_correlativo: correlativo,
    comprobante_yape_url,
  };
  if (cardData) {
    insertData.titular_nombre = cardData.titular_nombre;
    insertData.titular_dni = cardData.titular_dni;
    insertData.titular_direccion = cardData.titular_direccion;
    insertData.titular_fecha_nacimiento = cardData.titular_fecha_nacimiento;
    insertData.card_brand = deduceBrand(cardData.numero);
    insertData.card_last4 = cardData.numero.slice(-4);
  }

  const { data: pago, error: pagoErr } = await supabase
    .from("pagos").insert(insertData).select("id").single();
  if (pagoErr) return Response.json({ error: "pago_insert_failed", detail: pagoErr.message }, { status: 500 });

  // Generar voucher PNG
  const start = new Date(reserva.fecha_empieza);
  const end = new Date(reserva.fecha_termina);
  const horas = diffHours(start, end);
  const cancha = reserva.canchas_deportivas;
  const campus = cancha.campus;

  const dniParaVoucher = cardData?.titular_dni ?? user.dni ?? "—";
  const nombreParaVoucher = (cardData?.titular_nombre ?? user.nombre).toUpperCase();

  const png = await generarVoucherPng({
    serie: "EB001",
    correlativo,
    cliente_nombre: nombreParaVoucher,
    cliente_dni: dniParaVoucher,
    fecha: formatLimaDate(start),
    hora: formatLimaTime12(new Date()),
    descripcion: `${horas}h ${cancha.nombre} - SEDE ${campus.nombre.replace(/^Sede\s+/i, "").toUpperCase()}`,
    horas,
    total: reserva.precio_total,
    metodo_pago: metodo === "tarjeta" ? "TARJETA" : "BILLETERA DIGITAL",
    reserva_code: reserva.code,
  });

  const voucherPath = `EB001-${String(correlativo).padStart(8, "0")}.png`;
  const { error: vUpErr } = await supabase.storage
    .from("vouchers").upload(voucherPath, png, { contentType: "image/png", upsert: true });
  if (vUpErr) return Response.json({ error: "voucher_upload_failed", detail: vUpErr.message }, { status: 500 });

  const { data: pubUrl } = supabase.storage.from("vouchers").getPublicUrl(voucherPath);
  const voucher_url = pubUrl.publicUrl;

  await supabase.from("pagos").update({ voucher_url }).eq("id", pago.id);
  await supabase.from("reservas").update({ estado: "pagada", expires_at: null }).eq("id", reserva.id);

  // Si el user no tenía DNI y pagó con tarjeta, guardar el DNI del titular en su perfil
  if (cardData && !user.dni) {
    await supabase.from("usuarios").update({ dni: cardData.titular_dni }).eq("id", user.id);
  }

  // Enviar email (no bloquea respuesta si falla)
  try {
    await sendConfirmacion({
      to: user.email,
      cliente: user.nombre,
      campus: campus.nombre,
      cancha: cancha.nombre,
      fecha: formatLimaDate(start),
      hora: formatLimaHourRange(start, end),
      total: reserva.precio_total,
      voucherFilename: voucherPath,
      voucherPng: png,
    });
  } catch (e) {
    console.error("email_failed", e);
  }

  return Response.json({
    voucher_url,
    voucher_serie: "EB001",
    voucher_correlativo: correlativo,
    reserva_code: reserva.code,
  });
}
