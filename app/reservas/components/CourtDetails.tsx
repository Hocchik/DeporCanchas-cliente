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
      <aside className="bg-snow-white p-5 shadow-sm h-full text-base">
        <h2 className="text-xl font-semibold text-main mb-4">
          Detalles de cancha
        </h2>
        <p className="text-base text-main">
          No hay canchas disponibles para este filtro.
        </p>
      </aside>
    );
  }

  return (
    <aside className="bg-snow-white p-5 shadow-sm h-full text-base">
      <h2 className="text-xl font-semibold text-main mb-4 mt-5">
        Detalles de cancha
      </h2>
      <div className="space-y-4">
        <div>
          <p className="text-lg font-semibold text-forest-green">
            {selectedCourt.name}
          </p>
          <p className="text-base text-main">
            {selectedCampus?.name} - {selectedCampus?.address}
          </p>
          <p className="text-base text-main mt-1">
            Fecha: {selectedDate?.toLocaleDateString("es-PE")}
          </p>
        </div>

        <div>
          <p className="text-base text-main mb-2">Horarios seleccionados</p>
          {selectedSlots.length ? (
            <div className="flex flex-wrap gap-2">
              {selectedSlots.map((slot) => (
                <span
                  key={slot}
                  className="rounded-full bg-grass-green px-3 py-1 text-base font-semibold text-forest-green"
                >
                  {formatTimeRange24(slot)}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-base text-main">
              Aun no seleccionas horarios.
            </p>
          )}
        </div>

        <div className="rounded-xl bg-stone-gray px-3 py-3 text-base text-main">
          <p className="font-semibold">Ayuda de reserva</p>
          <p>
            Puedes elegir 1 hora o 2 horas consecutivas. Si una hora esta
            bloqueada u ocupada, no podras saltarla.
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-stone-gray pt-4">
          <span className="text-base font-semibold text-main">Total:</span>
          <span className="text-xl font-bold text-forest-green">
            S/{totalPrice.toFixed(2)}
          </span>
        </div>

        <button
          type="button"
          className="w-full bg-forest-green text-snow-white py-3 rounded-xl font-semibold shadow hover:bg-main transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isDisabled}
          onClick={handleConfirm}
        >
          {submitting ? "Procesando…" : "Confirmar horarios"}
        </button>
      </div>
    </aside>
  );
}
