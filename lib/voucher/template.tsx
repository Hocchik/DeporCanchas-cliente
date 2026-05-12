import { EMPRESA } from "./empresa";
import { numeroALetras } from "./numeroALetras";

export type VoucherData = {
  serie: string;
  correlativo: number;
  cliente_nombre: string;
  cliente_dni: string;
  fecha: string;          // dd/mm/yyyy
  hora: string;           // hh:mm AM/PM
  descripcion: string;    // ej. "2h CANCHA F11 (A1) - SEDE MIRAFLORES"
  horas: number;
  total: number;
  metodo_pago: string;    // "TARJETA" | "BILLETERA DIGITAL"
  qr_data_url: string;
  reserva_code: string;
};

export function VoucherTemplate(d: VoucherData) {
  const correlativoStr = String(d.correlativo).padStart(8, "0");
  const igv = Number((d.total - d.total / 1.18).toFixed(2));
  const gravado = Number((d.total - igv).toFixed(2));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: "white",
        padding: "20px",
        fontFamily: "sans-serif",
        color: "#0f2f1f",
      }}
    >
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
        <div style={{
          display: "flex",
          backgroundColor: "#0f2f1f", color: "white", padding: "10px 30px",
          borderRadius: 8, fontSize: 24, fontWeight: 700,
        }}>DeporCanchas</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", fontSize: 11, marginBottom: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 13 }}>{EMPRESA.nombre}</div>
        <div>{EMPRESA.direccion}</div>
        <div>Tel: {EMPRESA.telefono}</div>
        <div>Correo: {EMPRESA.correo}</div>
        <div>web: {EMPRESA.web}</div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
        BOLETA DE VENTA ELECTRÓNICA
      </div>
      <div style={{ display: "flex", justifyContent: "center", fontWeight: 700, fontSize: 13, marginBottom: 12 }}>
        {d.serie} - {correlativoStr}
      </div>

      <div style={{ display: "flex", justifyContent: "center", fontWeight: 700, marginBottom: 2 }}>{d.cliente_nombre}</div>
      <div style={{ display: "flex", justifyContent: "center", fontSize: 11, marginBottom: 12 }}>DNI: {d.cliente_dni}</div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 8, borderTop: "1px solid #ddd", paddingTop: 8 }}>
        <div style={{ display: "flex" }}><strong>FECHA:&nbsp;</strong> {d.fecha}</div>
        <div style={{ display: "flex" }}><strong>HORA:&nbsp;</strong> {d.hora}</div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontWeight: 700, borderTop: "1px solid #ddd", paddingTop: 6 }}>
        <div style={{ display: "flex", width: "30%" }}>HORAS</div>
        <div style={{ display: "flex", width: "30%" }}>COD</div>
        <div style={{ display: "flex", width: "20%", justifyContent: "flex-end" }}>PRECIO</div>
        <div style={{ display: "flex", width: "20%", justifyContent: "flex-end" }}>TOTAL</div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginTop: 4 }}>
        <div style={{ display: "flex", width: "30%" }}>{d.horas}h</div>
        <div style={{ display: "flex", width: "30%", fontSize: 9 }}>{d.reserva_code}</div>
        <div style={{ display: "flex", width: "20%", justifyContent: "flex-end" }}>{d.total.toFixed(2)}</div>
        <div style={{ display: "flex", width: "20%", justifyContent: "flex-end" }}>{d.total.toFixed(2)}</div>
      </div>
      <div style={{ display: "flex", fontSize: 10, marginTop: 2 }}>{d.descripcion}</div>

      <div style={{ display: "flex", flexDirection: "column", borderTop: "1px solid #ddd", marginTop: 10, paddingTop: 8, fontSize: 11 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>TOTAL GRAVADO</span><span>(S/) {gravado.toFixed(2)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>I.G.V</span><span>(S/) {igv.toFixed(2)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 16, marginTop: 4 }}>
          <span>TOTAL</span><span>(S/) {d.total.toFixed(2)}</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", fontSize: 10, marginTop: 10 }}>
        <div style={{ display: "flex" }}><strong>SON:&nbsp;</strong> {numeroALetras(d.total)} SOLES</div>
        <div style={{ display: "flex" }}><strong>FORMA DE PAGO:&nbsp;</strong> {d.metodo_pago}</div>
        <div style={{ display: "flex" }}><strong>COND. VENTA:&nbsp;</strong> CONTADO</div>
        <div style={{ display: "flex", marginTop: 4 }}><strong>Observaciones:</strong></div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
        <img src={d.qr_data_url} width={120} height={120} alt="QR" />
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", fontSize: 9, marginTop: 12, color: "#555" }}>
        <div>Representación impresa de la BOLETA DE VENTA ELECTRÓNICA</div>
        <div>Documento simulado sin validez legal</div>
      </div>
    </div>
  );
}
