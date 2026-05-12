import "server-only";
import { ImageResponse } from "next/og";
import QRCode from "qrcode";
import { VoucherTemplate, type VoucherData } from "./template";

export async function generarVoucherPng(data: Omit<VoucherData, "qr_data_url">): Promise<Buffer> {
  const qr_data_url = await QRCode.toDataURL(data.reserva_code, { margin: 0, width: 240 });
  const img = new ImageResponse(<VoucherTemplate {...data} qr_data_url={qr_data_url} />, {
    width: 400,
    height: 800,
  });
  const ab = await img.arrayBuffer();
  return Buffer.from(ab);
}
