import React from "react";

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
    <aside
      className="order-1 hidden h-auto shadow-sm md:order-1 md:block p-5 md:sticky md:top-0 self-start"
      style={{ backgroundColor: "#F7FAFC" }}
    >
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-forest-green mt-5">
          Nuestros Campus
        </h2>
        <p className="text-base text-main">Selecciona tu campus preferido</p>
      </div>
      <div className="space-y-2">
        {campuses.map((campus) => (
          <button
            key={campus.id}
            type="button"
            onClick={() => onSelect(campus.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${
              selectedCampusId === campus.id
                ? "bg-grass-green text-forest-green"
                : "text-main hover:bg-snow-white"
            }`}
          >
            <span className="text-base font-semibold">{campus.name}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
