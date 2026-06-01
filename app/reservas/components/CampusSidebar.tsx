import React from "react";
import { MapPinIcon } from "@heroicons/react/24/solid";

type Campus = {
  id: string;
  name: string;
};

interface CampusSidebarProps {
  campuses: Campus[];
  selectedCampusId: string;
  onSelect: (id: string) => void;
}

export default function CampusSidebar({ campuses, selectedCampusId, onSelect }: CampusSidebarProps) {
  return (
    <aside className="order-1 hidden lg:order-1 lg:block lg:sticky lg:top-20 self-start">
      <div className="card-soft p-5">
        <h2 className="font-display font-semibold text-lg text-primary mb-4">
          Sedes
        </h2>

        <div className="space-y-1.5">
          {campuses.map((campus) => {
            const active = selectedCampusId === campus.id;
            return (
              <button
                key={campus.id}
                type="button"
                onClick={() => onSelect(campus.id)}
                className={[
                  "group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition border",
                  active
                    ? "bg-brand text-on-brand border-brand shadow-soft"
                    : "border-transparent text-primary hover:bg-brand-soft hover:border-soft",
                ].join(" ")}
              >
                <span
                  className={[
                    "inline-flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition",
                    active ? "bg-on-brand text-brand" : "bg-accent text-brand",
                  ].join(" ")}
                  style={active ? { backgroundColor: "var(--text-on-brand)", color: "var(--brand)" } : undefined}
                >
                  <MapPinIcon className="w-4 h-4" />
                </span>
                <span className="font-semibold text-sm flex-1 truncate">
                  {campus.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
