"use client";

import { CalendarDaysIcon, ClockIcon, MapPinIcon } from "@heroicons/react/24/solid";
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
    ? `${earliest} - ${String(Number(latest.slice(0, 2)) + 1).padStart(2, "0")}:${latest.slice(3)}`
    : "—";

  return (
    <aside className="card-soft overflow-hidden h-fit">
      <div className="relative h-32 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={court} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 text-snow-white">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-90">{court}</p>
          <p className="text-base font-display font-bold leading-tight">{campus}</p>
        </div>
      </div>

      <div className="p-5">
        <p className="text-eyebrow text-brand mb-3">Resumen</p>

        <div className="space-y-2.5 text-sm">
          {address && (
            <Row icon={<MapPinIcon className="w-4 h-4" />} text={address} />
          )}
          <Row icon={<CalendarDaysIcon className="w-4 h-4" />} text={date ? date.toLocaleDateString("es-PE", { weekday: "long", day: "2-digit", month: "long" }) : "—"} />
          <Row icon={<ClockIcon className="w-4 h-4" />} text={rangeLabel} />
        </div>

        <div className="mt-4 border-t border-soft pt-4 space-y-2 text-sm">
          {slots.length ? slots.map((slot) => (
            <div key={slot} className="flex items-center justify-between text-muted">
              <span>{formatTimeRange24(slot)}</span>
              <span className="text-primary font-medium">S/{perSlot.toFixed(2)}</span>
            </div>
          )) : (
            <p className="text-muted">Sin horarios seleccionados.</p>
          )}
        </div>

        <div className="mt-4 border-t border-soft pt-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-muted">Total</span>
          <span className="text-2xl font-display font-bold text-brand">
            S/{total.toFixed(2)}
          </span>
        </div>
      </div>
    </aside>
  );
}

function Row({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-muted">
      <span className="text-brand opacity-70">{icon}</span>
      <span className="capitalize">{text}</span>
    </div>
  );
}
