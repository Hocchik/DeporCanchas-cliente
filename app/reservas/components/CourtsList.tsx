import type { Campus, Court } from "../types";
import { getStatusForCourt, LEGEND_COLORS } from "../utils";

type CourtsListProps = {
  courts: Court[];
  selectedCampus?: Campus;
  selectedDate?: Date;
  selectedCourtId: string;
  onSelectCourt: (courtId: string) => void;
};

export default function CourtsList({
  courts,
  selectedCampus,
  selectedDate,
  selectedCourtId,
  onSelectCourt,
}: CourtsListProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 text-xs text-main">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: LEGEND_COLORS.occupied }}
          />
          Ocupado
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full border"
            style={{
              backgroundColor: LEGEND_COLORS.free,
              borderColor: "#E2E8F0",
            }}
          />
          Libre
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: LEGEND_COLORS.blocked }}
          />
          Bloqueado
        </div>
      </div>

      {courts.map((court) => {
        const timeStatus = selectedDate
          ? getStatusForCourt(court, selectedDate)
          : [];

        return (
          <button
            key={court.id}
            type="button"
            onClick={() => onSelectCourt(court.id)}
            className={`w-full text-left bg-snow-white rounded-2xl p-4 shadow-sm border-2 transition ${
              selectedCourtId === court.id
                ? "border-forest-green shadow-md"
                : "border-transparent hover:border-forest-green/60"
            }`}
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-40 h-28 rounded-xl overflow-hidden bg-stone-gray">
                <img
                  src={court.image}
                  alt={court.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-forest-green">
                      {court.name}
                    </h3>
                    <p className="text-xs text-main">
                      {selectedCampus?.address}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-forest-green">
                    S/{court.pricePerHour.toFixed(2)}/h
                  </span>
                </div>

                <div className="mt-3">
                  <p className="text-xs text-main mb-2">
                    Horarios disponibles (1h)
                  </p>
                  <div className="relative">
                    <div className="grid grid-cols-14 gap-1 text-[10px] text-main mb-1">
                      <span className="col-span-1 text-left">8AM</span>
                      <span className="col-start-5 col-span-1 text-center">
                        12PM
                      </span>
                      <span className="col-start-9 col-span-1 text-center">
                        4PM
                      </span>
                      <span className="col-start-13 col-span-1 text-center">
                        8PM
                      </span>
                      {/* <span className="col-start-14 col-span-1 text-right">
                        10PM
                      </span> */}
                    </div>
                    <div className="grid grid-cols-14 gap-1">
                      {timeStatus.map((slot) => (
                        <span
                          key={slot.time}
                          className="h-4 rounded-full border"
                          title={slot.time}
                          style={{
                            backgroundColor: LEGEND_COLORS[slot.status],
                            borderColor:
                              slot.status === "free" ? "#E2E8F0" : "transparent",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
