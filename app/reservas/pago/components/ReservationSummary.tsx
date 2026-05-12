"use client";

import { formatTimeRange24 } from "../../utils";

type Props = {
  campus: string; address?: string; court: string; image: string;
  date: Date | null; slots: string[]; total: number;
};

export default function ReservationSummary({ campus, address, court, image, date, slots, total }: Props) {
  const perSlot = slots.length ? total / slots.length : 0;
  const sorted = [...slots].sort();
  const earliest = sorted[0];
  const latest = sorted[sorted.length - 1];
  const rangeLabel = earliest && latest
    ? `${earliest} - ${String(Number(latest.slice(0,2)) + 1).padStart(2, "0")}:${latest.slice(3)}`
    : "-";

  return (
    <aside className="rounded-2xl bg-snow-white p-5 shadow-sm h-fit">
      <h3 className="text-sm font-semibold text-main mb-4">Resumen de tu reserva</h3>
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={court} className="h-16 w-24 rounded-lg object-cover" />
        <div>
          <p className="font-semibold text-main">{campus}</p>
          <p className="text-xs text-main">{court}{address ? ` • ${address}` : ""}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-stone-gray/40 px-3 py-2">
          <p className="text-xs text-main">Fecha</p>
          <p className="text-sm font-semibold text-main">{date ? date.toLocaleDateString("es-PE") : "-"}</p>
        </div>
        <div className="rounded-xl bg-stone-gray/40 px-3 py-2">
          <p className="text-xs text-main">Hora</p>
          <p className="text-sm font-semibold text-main">{rangeLabel}</p>
        </div>
      </div>
      <div className="mt-4 space-y-2 text-sm text-main">
        {slots.length ? (
          slots.map((slot) => (
            <div key={slot} className="flex items-center justify-between">
              <span>{formatTimeRange24(slot)}</span>
              <span>S/{perSlot.toFixed(2)}</span>
            </div>
          ))
        ) : <p>Sin horarios seleccionados.</p>}
      </div>
      <div className="mt-4 border-t border-stone-gray pt-4 flex items-center justify-between">
        <span className="font-semibold text-main">Total</span>
        <span className="text-lg font-bold text-forest-green">S/{total.toFixed(2)}</span>
      </div>
    </aside>
  );
}
