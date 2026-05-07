import React from "react";

type Campus = {
  id: string;
  name: string;
};

interface CampusMobileMenuProps {
  campuses: Campus[];
  selectedCampusId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
}

export default function CampusMobileMenu({ campuses, selectedCampusId, isOpen, onClose, onSelect }: CampusMobileMenuProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-40 md:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative mx-auto mt-16 w-[90%] max-w-sm rounded-2xl bg-snow-white p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-forest-green">Nuestros Campus</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-stone-gray px-3 py-1 text-base"
            aria-label="Cerrar menu de sedes"
          >
            ×
          </button>
        </div>
        <p className="text-base text-main mb-3">Selecciona tu campus preferido</p>
        <div className="space-y-2">
          {campuses.map((campus) => (
            <button
              key={campus.id}
              type="button"
              onClick={() => {
                onSelect(campus.id);
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${
                selectedCampusId === campus.id
                  ? "bg-grass-green text-forest-green"
                  : "text-main hover:bg-stone-gray"
              }`}
            >
              <span className="text-base font-semibold">{campus.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
