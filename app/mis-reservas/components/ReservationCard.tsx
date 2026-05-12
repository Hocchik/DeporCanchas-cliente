"use client";

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
  pagada:    { label: "Pagada",    cls: "bg-grass-green text-forest-green" },
  pendiente: { label: "Pendiente", cls: "bg-yellow-100 text-yellow-800" },
  cancelada: { label: "Cancelada", cls: "bg-stone-gray text-main" },
  expirada:  { label: "Expirada",  cls: "bg-red-100 text-red-700" },
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
  const fechaLabel = start.toLocaleDateString("es-PE", { weekday: "short", day: "2-digit", month: "long" });
  const horaLabel = `${start.getHours().toString().padStart(2,"0")}:00 - ${end.getHours().toString().padStart(2,"0")}:00`;
  const cancha = reserva.canchas_deportivas;
  const campus = cancha.campus;
  const estado = ESTADOS[reserva.estado] ?? { label: reserva.estado, cls: "bg-stone-gray text-main" };

  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left flex gap-4 rounded-2xl bg-snow-white p-4 shadow-sm hover:shadow-md transition w-full"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageForType(cancha.tipo_deporte)}
        alt={cancha.nombre}
        className="h-24 w-32 rounded-xl object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-main">{cancha.nombre}</p>
        <p className="text-xs text-main">{campus.nombre}</p>
        <p className="text-sm text-main mt-1">{fechaLabel}</p>
        <p className="text-sm text-main">{horaLabel}</p>
      </div>
      <div className="flex flex-col items-end justify-between">
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${estado.cls}`}>
          {estado.label}
        </span>
        <span className="text-lg font-bold text-forest-green">S/{reserva.precio_total.toFixed(2)}</span>
      </div>
    </button>
  );
}
