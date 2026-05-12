"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import CountdownTimer from "./components/CountdownTimer";
import PaymentProcessingModal, { type PaymentModalState } from "./components/PaymentProcessingModal";
import YapePaymentForm from "./components/YapePaymentForm";
import CardPaymentForm, { type CardFormValues } from "./components/CardPaymentForm";
import ReservationSummary from "./components/ReservationSummary";

type ReservaResp = {
  reserva: {
    id: number; code: string; estado: string;
    fecha_empieza: string; fecha_termina: string;
    precio_total: number; expires_at: string;
    canchas_deportivas: {
      id: number; nombre: string; tipo_deporte: string;
      campus: { id: number; nombre: string; ubicacion: string };
    };
  };
};

function buildSlots(start: Date, end: Date): string[] {
  const out: string[] = [];
  const d = new Date(start);
  while (d < end) {
    out.push(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
    d.setHours(d.getHours() + 1);
  }
  return out;
}

function imageForType(t: string): string {
  const n = t.toLowerCase();
  if (n.includes("tenis")) return "/Canchasfutbol8.jpg";
  if (n.includes("padel")) return "/Clubterrazas_Miraflores.jpg";
  return "/Canchas_de_futbol_los_olivos.png";
}

export default function PagoPageWrapper() {
  return (
    <Suspense fallback={<PageWrap><p className="p-8">Cargando…</p></PageWrap>}>
      <PagoPage />
    </Suspense>
  );
}

function PagoPage() {
  const router = useRouter();
  const params = useSearchParams();
  const code = params.get("code");

  const [data, setData] = useState<ReservaResp["reserva"] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [method, setMethod] = useState<"wallet" | "card">("wallet");
  const [modal, setModal] = useState<PaymentModalState>({ kind: "hidden" });

  useEffect(() => {
    if (!code) { router.push("/reservas"); return; }
    (async () => {
      const res = await fetch(`/api/reservas/by-code/${code}`);
      if (res.status === 401) { router.push("/login?next=/reservas"); return; }
      if (!res.ok) { setLoadError("No se pudo cargar la reserva"); return; }
      const json: ReservaResp = await res.json();
      if (json.reserva.estado !== "pendiente") {
        router.push("/reservas?expired=1"); return;
      }
      setData(json.reserva);
    })();
  }, [code, router]);

  const start = useMemo(() => data ? new Date(data.fecha_empieza) : null, [data]);
  const end = useMemo(() => data ? new Date(data.fecha_termina) : null, [data]);
  const slots = useMemo(() => start && end ? buildSlots(start, end) : [], [start, end]);

  if (loadError) return <PageWrap><p className="p-8">{loadError}</p></PageWrap>;
  if (!data || !start || !end) return <PageWrap><p className="p-8">Cargando…</p></PageWrap>;

  const handleYape = async (file: File) => {
    setModal({ kind: "processing" });
    const fd = new FormData();
    fd.append("reserva_code", data.code);
    fd.append("metodo_pago", "yape");
    fd.append("comprobante", file);
    const res = await fetch("/api/pagos", { method: "POST", body: fd });
    await afterPagoResponse(res);
  };

  const handleCard = async (values: CardFormValues) => {
    setModal({ kind: "processing" });
    const res = await fetch("/api/pagos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reserva_code: data.code, metodo_pago: "tarjeta", ...values }),
    });
    await afterPagoResponse(res);
  };

  async function afterPagoResponse(res: Response) {
    if (!res.ok) {
      setModal({ kind: "hidden" });
      const j = await res.json().catch(() => ({}));
      alert(`Error al procesar el pago: ${j.error ?? "desconocido"}`);
      return;
    }
    const out = await res.json();
    setModal({
      kind: "success",
      voucherUrl: out.voucher_url,
      campus: data!.canchas_deportivas.campus.nombre,
      cancha: data!.canchas_deportivas.nombre,
      reservaCode: data!.code,
      fecha: start!.toLocaleDateString("es-PE"),
      metodoPago: method === "wallet" ? "Billetera Digital" : "Tarjeta",
      horarios: slots.map((s) => ({
        label: `${s} - ${String(Number(s.slice(0,2)) + 1).padStart(2, "0")}:${s.slice(3)}`,
        precio: data!.precio_total / slots.length,
      })),
      total: data!.precio_total,
    });
  }

  const cancha = data.canchas_deportivas;
  const campus = cancha.campus;

  return (
    <PageWrap>
      <section className="max-w-6xl mx-auto px-4 py-10 w-full flex-1">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-widest text-main">Paso final</p>
            <h1 className="text-3xl md:text-4xl font-bold text-main">Confirmación de Pago</h1>
          </div>
          <CountdownTimer expiresAt={data.expires_at} onExpire={() => router.push("/reservas?expired=1")} />
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <div>
            <div className="inline-flex rounded-full bg-stone-gray p-1">
              <button type="button" onClick={() => setMethod("wallet")}
                className={`px-4 py-2 text-sm font-semibold rounded-full transition border ${
                  method === "wallet" ? "bg-snow-white text-main border-stone-gray" : "text-main border-transparent opacity-70"
                }`}>Billetera Digital (Yape/Plin)</button>
              <button type="button" onClick={() => setMethod("card")}
                className={`px-4 py-2 text-sm font-semibold rounded-full transition border ${
                  method === "card" ? "bg-snow-white text-main border-stone-gray" : "text-main border-transparent opacity-70"
                }`}>Credit/Debit Card</button>
            </div>
            <div className="mt-6">
              {method === "wallet"
                ? <YapePaymentForm onSubmit={handleYape} disabled={modal.kind === "processing"} />
                : <CardPaymentForm onSubmit={handleCard} disabled={modal.kind === "processing"} />}
            </div>
          </div>

          <ReservationSummary
            campus={campus.nombre}
            address={campus.ubicacion}
            court={cancha.nombre}
            image={imageForType(cancha.tipo_deporte)}
            date={start}
            slots={slots}
            total={data.precio_total}
          />
        </div>
      </section>

      <PaymentProcessingModal
        state={modal}
        onVolver={() => router.push("/mis-reservas")}
      />
    </PageWrap>
  );
}

function PageWrap({ children }: { children: React.ReactNode }) {
  return (
    <main
      className="min-h-screen text-base flex flex-col"
      style={{ backgroundColor: "#FBF9F5", ["--grass-green" as string]: "#84C940" } as React.CSSProperties}
    >
      <Navbar />
      {children}
      <Footer />
    </main>
  );
}
