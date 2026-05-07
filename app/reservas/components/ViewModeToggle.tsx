import React from "react";
import { MapIcon, QueueListIcon } from "@heroicons/react/24/solid";

interface ViewModeToggleProps {
  viewMode: "list" | "map";
  setViewMode: (mode: "list" | "map") => void;
}

export default function ViewModeToggle({ viewMode, setViewMode }: ViewModeToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setViewMode("list")}
        aria-label="Ver listado"
        className={`relative overflow-hidden px-4 py-2 rounded-lg border transition ${
          viewMode === "list" ? "border-forest-green" : "border-stone-gray"
        }`}
      >
        <span
          className={`absolute inset-0 bg-snow-white transition duration-200 ${
            viewMode === "list" ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        />
        <QueueListIcon
          className={`relative z-10 w-5 h-5 transition ${
            viewMode === "list" ? "text-forest-green" : "text-main"
          }`}
        />
      </button>
      <button
        type="button"
        onClick={() => setViewMode("map")}
        aria-label="Ver croquis"
        className={`relative overflow-hidden px-4 py-2 rounded-lg border transition ${
          viewMode === "map" ? "border-forest-green" : "border-stone-gray"
        }`}
      >
        <span
          className={`absolute inset-0 bg-snow-white transition duration-200 ${
            viewMode === "map" ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        />
        <MapIcon
          className={`relative z-10 w-5 h-5 transition ${
            viewMode === "map" ? "text-forest-green" : "text-main"
          }`}
        />
      </button>
    </div>
  );
}
