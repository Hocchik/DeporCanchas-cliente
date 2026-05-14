"use client";

import { ChevronRightIcon } from "@heroicons/react/24/solid";

export type Reserva = {
  id: number;
  code: string;
  estado: string;
  fecha_empieza: string;
  fecha_termina: string;
  precio_total: number;
  canchas_deportivas: {
    id: number; nombre: string; tipo_deporte: string;
    campus: { id: number; nombre: string; ubicacion: string };
  };
  pagos: { voucher_url: string | null; metodo_pago?: string }[] | null;
};

const ESTADOS: Record<string, { label: string; cls: string }> = {
  pagada:    { label: "Pagada",    cls: "bg-accent text-brand" },
  pendiente: { label: "Pendiente", cls: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200" },
  cancelada: { label: "Cancelada", cls: "bg-surface-alt text-muted border border-default" },
  expirada:  { label: "Expirada",  cls: "bg-danger-soft text-danger" },
};

function imageForType(t: string): string {
  const n = t.toLowerCase();
  if (n.includes("tenis")) return "/Canchasfutbol8.jpg";
  if (n.includes("padel")) return "/Clubterrazas_Miraflores.jpg";
  return "/Canchas_de_futbol_los_olivos.png";
}

export default function ReservationCard({ reserva, onClick }: { reserva: Reserva; onClick: () => void }) {
  const start = new Date(reserva.fecha_empieza);
  const end = new Date(reserva.fecha_termina);
  const fechaLabel = start.toLocaleDateString("es-PE", { weekday: "long", day: "2-digit", month: "long" });
  const horaLabel = `${start.getHours().toString().padStart(2, "0")}:00 — ${end.getHours().toString().padStart(2, "0")}:00`;
  const cancha = reserva.canchas_deportivas;
  const campus = cancha.campus;
  const estado = ESTADOS[reserva.estado] ?? { label: reserva.estado, cls: "bg-surface-alt text-muted" };

  return (
    <button
      type="button"
      onClick={onClick}
      className="card-soft text-left flex gap-4 p-4 w-full group"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageForType(cancha.tipo_deporte)}
        alt={cancha.nombre}
        className="h-24 w-32 rounded-xl object-cover flex-shrink-0 transition-transform group-hover:scale-[1.02]"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-display font-semibold text-primary truncate">{cancha.nombre}</p>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${estado.cls}`}>
            {estado.label}
          </span>
        </div>
        <p className="text-xs text-muted truncate mt-0.5">{campus.nombre}</p>
        <p className="text-sm text-primary mt-2 capitalize">{fechaLabel}</p>
        <p className="text-sm text-muted">{horaLabel}</p>
      </div>
      <div className="flex flex-col items-end justify-between shrink-0">
        <span className="text-lg font-display font-bold text-brand">S/{reserva.precio_total.toFixed(2)}</span>
        <ChevronRightIcon className="w-5 h-5 text-muted group-hover:text-brand group-hover:translate-x-0.5 transition" />
      </div>
    </button>
  );
}
