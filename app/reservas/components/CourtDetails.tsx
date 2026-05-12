import { ArrowRightIcon, CalendarDaysIcon, ClockIcon, MapPinIcon, InformationCircleIcon } from "@heroicons/react/24/solid";
import type { Campus, Court } from "../types";
import { formatTimeRange24 } from "../utils";

type CourtDetailsProps = {
  selectedCourt?: Court;
  selectedCampus?: Campus;
  selectedDate?: Date;
  selectedSlots: string[];
  totalPrice: number;
  onConfirm?: (payload: {
    campusName?: string;
    campusAddress?: string;
    courtName?: string;
    courtImage?: string;
    date?: Date;
    slots: string[];
    total: number;
  }) => void;
  submitting?: boolean;
};

export default function CourtDetails({
  selectedCourt,
  selectedCampus,
  selectedDate,
  selectedSlots,
  totalPrice,
  onConfirm,
  submitting,
}: CourtDetailsProps) {
  const isDisabled = selectedSlots.length === 0 || !selectedCourt || Boolean(submitting);

  const handleConfirm = () => {
    if (isDisabled) return;
    onConfirm?.({
      campusName: selectedCampus?.name,
      campusAddress: selectedCampus?.address,
      courtName: selectedCourt?.name,
      courtImage: selectedCourt?.image,
      date: selectedDate,
      slots: selectedSlots,
      total: totalPrice,
    });
  };

  if (!selectedCourt) {
    return (
      <aside className="card-soft p-5">
        <p className="text-eyebrow text-brand mb-2">Detalle</p>
        <h2 className="font-display font-semibold text-lg text-primary mb-2">
          Sin cancha seleccionada
        </h2>
        <p className="text-sm text-muted">
          No hay canchas disponibles para este filtro.
        </p>
      </aside>
    );
  }

  return (
    <aside className="card-soft p-5">
      <p className="text-eyebrow text-brand mb-2">Tu reserva</p>
      <h2 className="font-display font-semibold text-lg text-primary">
        {selectedCourt.name}
      </h2>

      <div className="mt-3 space-y-1.5 text-sm">
        <Row icon={<MapPinIcon className="w-4 h-4" />} text={`${selectedCampus?.name ?? "Sede"} · ${selectedCampus?.address ?? ""}`} />
        <Row icon={<CalendarDaysIcon className="w-4 h-4" />} text={selectedDate?.toLocaleDateString("es-PE", { weekday: "long", day: "2-digit", month: "long" }) ?? "—"} />
      </div>

      <div className="mt-5">
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
          Horarios
        </p>
        {selectedSlots.length ? (
          <div className="flex flex-wrap gap-2">
            {selectedSlots.map((slot) => (
              <span
                key={slot}
                className="inline-flex items-center gap-1 chip chip-strong"
              >
                <ClockIcon className="w-3.5 h-3.5" />
                {formatTimeRange24(slot)}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">
            Aún no seleccionas horarios.
          </p>
        )}
      </div>

      <div className="mt-5 flex gap-3 rounded-xl bg-brand-soft border border-soft px-3 py-2.5">
        <InformationCircleIcon className="w-5 h-5 text-brand shrink-0 mt-0.5" />
        <div className="text-xs text-muted leading-relaxed">
          <span className="font-semibold text-primary">Tip:</span> puedes elegir 1 hora o 2 horas consecutivas.
        </div>
      </div>

      <div className="mt-5 border-t border-soft pt-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-muted">Total a pagar</span>
        <span className="text-2xl font-display font-bold text-brand">
          S/{totalPrice.toFixed(2)}
        </span>
      </div>

      <button
        type="button"
        className="btn-primary w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isDisabled}
        onClick={handleConfirm}
      >
        {submitting ? "Procesando…" : "Continuar al pago"}
        {!submitting && <ArrowRightIcon className="w-4 h-4" />}
      </button>
    </aside>
  );
}

function Row({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-muted">
      <span className="text-brand opacity-70">{icon}</span>
      <span className="truncate">{text}</span>
    </div>
  );
}
