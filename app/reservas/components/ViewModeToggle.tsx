import React from "react";
import { MapIcon, QueueListIcon } from "@heroicons/react/24/solid";

interface ViewModeToggleProps {
  viewMode: "list" | "map";
  setViewMode: (mode: "list" | "map") => void;
}

export default function ViewModeToggle({ viewMode, setViewMode }: ViewModeToggleProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-surface-alt p-1 border border-soft">
      <Btn active={viewMode === "list"} onClick={() => setViewMode("list")} ariaLabel="Ver listado">
        <QueueListIcon className="w-4 h-4" />
        <span className="hidden sm:inline">Lista</span>
      </Btn>
      <Btn active={viewMode === "map"} onClick={() => setViewMode("map")} ariaLabel="Ver croquis">
        <MapIcon className="w-4 h-4" />
        <span className="hidden sm:inline">Croquis</span>
      </Btn>
    </div>
  );
}

function Btn({ active, onClick, ariaLabel, children }: {
  active: boolean; onClick: () => void; ariaLabel: string; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={[
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition",
        active
          ? "bg-surface text-brand shadow-soft"
          : "text-muted hover:text-primary",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
