"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import CountdownTimer from "./components/CountdownTimer";
import PaymentProcessingModal, { type PaymentModalState } from "./components/PaymentProcessingModal";
import YapePaymentForm from "./components/YapePaymentForm";
import CardPaymentForm, { type CardFormValues } from "./components/CardPaymentForm";
import ReservationSummary from "./components/ReservationSummary";
import ConfirmExitModal from "./components/ConfirmExitModal";

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

  // Guard state
  const paidRef = useRef(false);              // true cuando el pago se completó (no se cancela al salir)
  const codeRef = useRef<string | null>(null); // para usar en cleanups async
  const [exitTo, setExitTo] = useState<string | "back" | null>(null);
  const [exitBusy, setExitBusy] = useState(false);

  // Carga inicial de la reserva
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
      codeRef.current = json.reserva.code;
    })();
  }, [code, router]);

  // Helper: cancelar reserva (best-effort, idempotente)
  const abandonReserva = useCallback(async (sync = false) => {
    const c = codeRef.current;
    if (!c) return;
    const url = `/api/reservas/by-code/${c}/abandon`;
    if (sync && typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      try { navigator.sendBeacon(url); return; } catch {}
    }
    try { await fetch(url, { method: "POST", keepalive: true }); } catch {}
  }, []);

  // 1) Cleanup al desmontar el componente: si no se pagó, abandonar
  useEffect(() => {
    return () => {
      if (!paidRef.current) abandonReserva(true);
    };
  }, [abandonReserva]);

  // 2) beforeunload: refresh / cerrar pestaña / escribir nueva URL
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (paidRef.current || !codeRef.current) return;
      e.preventDefault();
      e.returnValue = "";
      // sendBeacon es la única forma confiable durante unload
      abandonReserva(true);
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [abandonReserva]);

  // 3) Interceptar clicks en <a> internos (navbar, footer, links)
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (paidRef.current || !codeRef.current) return;
      if (e.defaultPrevented) return;
      if (e.button !== 0) return; // solo click izquierdo
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // dejar abrir en pestaña nueva
      const target = (e.target as HTMLElement)?.closest?.("a") as HTMLAnchorElement | null;
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href) return;
      if (target.target === "_blank") return;
      if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      // Si es la propia URL, no interceptar
      const currentPath = window.location.pathname + window.location.search;
      if (href === currentPath || href === window.location.pathname) return;
      // Solo internos
      let url = href;
      if (href.startsWith("http")) {
        try {
          const u = new URL(href);
          if (u.origin !== window.location.origin) return; // externo → dejar pasar
          url = u.pathname + u.search + u.hash;
        } catch { return; }
      }
      e.preventDefault();
      e.stopPropagation();
      setExitTo(url);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // 4) Trampa para botón atrás del navegador
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Empuja un estado dummy para que el botón "atrás" dispare popstate sin abandonar la página
    window.history.pushState({ guard: true }, "");
    const handler = () => {
      if (paidRef.current || !codeRef.current) return;
      window.history.pushState({ guard: true }, ""); // re-empujar para neutralizar
      setExitTo("back");
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  const start = useMemo(() => data ? new Date(data.fecha_empieza) : null, [data]);
  const end = useMemo(() => data ? new Date(data.fecha_termina) : null, [data]);
  const slots = useMemo(() => start && end ? buildSlots(start, end) : [], [start, end]);

  if (loadError) return <PageWrap><p className="p-8 text-danger">{loadError}</p></PageWrap>;
  if (!data || !start || !end) return <PageWrap><p className="p-8 text-muted">Cargando…</p></PageWrap>;

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
      if (j.error === "email_no_verificado") {
        alert(
          `${j.detail || "Verifica tu correo antes de completar el pago."}\n\nSubí al banner amarillo en la parte superior y haz clic en "Reenviar correo" si no te llegó.`
        );
        return;
      }
      alert(`Error al procesar el pago: ${j.error ?? "desconocido"}`);
      return;
    }
    paidRef.current = true; // ya no debemos cancelar al salir
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
        label: `${s} - ${String(Number(s.slice(0, 2)) + 1).padStart(2, "0")}:${s.slice(3)}`,
        precio: data!.precio_total / slots.length,
      })),
      total: data!.precio_total,
    });
  }

  const handleTimerExpire = async () => {
    if (paidRef.current) return;
    paidRef.current = true; // marcar para no disparar el guard al navegar
    await abandonReserva(false);
    router.push("/reservas?expired=1");
  };

  const cancelExit = () => setExitTo(null);
  const confirmExit = async () => {
    if (!exitTo) return;
    setExitBusy(true);
    await abandonReserva(false);
    paidRef.current = true; // evitar el cleanup secundario
    setExitBusy(false);
    if (exitTo === "back") {
      router.push("/reservas");
    } else {
      router.push(exitTo);
    }
  };

  const cancha = data.canchas_deportivas;
  const campus = cancha.campus;

  return (
    <PageWrap>
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12 w-full flex-1">
        <div className="flex items-end justify-between gap-4 flex-wrap mb-8">
          <div>
            <p className="text-eyebrow text-brand mb-2">Paso final</p>
            <h1 className="text-display-lg">Confirmación de pago</h1>
            <p className="text-muted text-sm mt-2">Elige cómo quieres pagar para asegurar tu cancha.</p>
          </div>
          <CountdownTimer expiresAt={data.expires_at} onExpire={handleTimerExpire} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          <div>
            <div className="inline-flex items-center gap-1 rounded-full bg-surface-alt p-1 border border-soft mb-5">
              <MethodBtn active={method === "wallet"} onClick={() => setMethod("wallet")}>
                Yape / Plin
              </MethodBtn>
              <MethodBtn active={method === "card"} onClick={() => setMethod("card")}>
                Tarjeta
              </MethodBtn>
            </div>

            {method === "wallet"
              ? <YapePaymentForm onSubmit={handleYape} disabled={modal.kind === "processing"} />
              : <CardPaymentForm onSubmit={handleCard} disabled={modal.kind === "processing"} />}
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

      <ConfirmExitModal
        open={exitTo !== null}
        onCancel={cancelExit}
        onConfirm={confirmExit}
        busy={exitBusy}
      />
    </PageWrap>
  );
}

function MethodBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "px-4 py-2 text-sm font-semibold rounded-full transition",
        active
          ? "bg-surface text-brand shadow-soft"
          : "text-muted hover:text-primary",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function PageWrap({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen text-base flex flex-col bg-app">
      <Navbar />
      {children}
      <Footer />
    </main>
  );
}
