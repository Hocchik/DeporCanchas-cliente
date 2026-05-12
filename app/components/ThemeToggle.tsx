"use client";

import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";
import { useTheme } from "../contexts/ThemeContext";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolved, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Renderiza un placeholder visualmente neutro hasta hidratar para evitar mismatch
  const label = mounted
    ? resolved === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"
    : "Cambiar tema";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`relative inline-flex items-center justify-center w-10 h-10 rounded-full border border-default text-brand hover:bg-brand-soft transition ${className}`}
    >
      <SunIcon
        className={`absolute w-5 h-5 transition-all duration-300 ${
          mounted && resolved === "dark" ? "opacity-0 -rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"
        }`}
      />
      <MoonIcon
        className={`absolute w-5 h-5 transition-all duration-300 ${
          mounted && resolved === "dark" ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-50"
        }`}
      />
    </button>
  );
}
