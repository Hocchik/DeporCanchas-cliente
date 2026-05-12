import React from "react";
import { MapPinIcon, XMarkIcon } from "@heroicons/react/24/solid";

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
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative mx-auto mt-16 w-[92%] max-w-sm rounded-2xl bg-surface-elev border border-default p-5 shadow-floating animate-fade-in-up">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-eyebrow text-brand mb-1">Sedes</p>
            <h2 className="font-display font-semibold text-lg text-primary">Nuestros campus</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-default text-muted hover:text-primary hover:border-strong transition"
            aria-label="Cerrar menú de sedes"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-muted mb-4">Elige tu campus preferido</p>
        <div className="space-y-1.5">
          {campuses.map((campus) => {
            const active = selectedCampusId === campus.id;
            return (
              <button
                key={campus.id}
                type="button"
                onClick={() => { onSelect(campus.id); onClose(); }}
                className={[
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition border",
                  active
                    ? "bg-brand text-on-brand border-brand"
                    : "border-transparent text-primary hover:bg-brand-soft hover:border-soft",
                ].join(" ")}
              >
                <span
                  className={[
                    "inline-flex items-center justify-center w-8 h-8 rounded-lg shrink-0",
                    active ? "" : "bg-accent text-brand",
                  ].join(" ")}
                  style={active ? { backgroundColor: "var(--text-on-brand)", color: "var(--brand)" } : undefined}
                >
                  <MapPinIcon className="w-4 h-4" />
                </span>
                <span className="font-semibold text-sm">{campus.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
