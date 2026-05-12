"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

type Ctx = {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  setMode: (m: ThemeMode) => void;
  toggle: () => void;
};

const ThemeContext = createContext<Ctx | null>(null);

function readSystem(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function readStored(): ThemeMode {
  if (typeof window === "undefined") return "system";
  const v = window.localStorage.getItem("theme");
  return v === "light" || v === "dark" ? v : "system";
}

function apply(resolved: ResolvedTheme) {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", resolved);
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [resolved, setResolved] = useState<ResolvedTheme>("light");

  // Initialise once on mount with stored value
  useEffect(() => {
    const stored = readStored();
    setModeState(stored);
    const next = stored === "system" ? readSystem() : stored;
    setResolved(next);
    apply(next);
  }, []);

  // React to OS changes when in "system" mode
  useEffect(() => {
    if (mode !== "system" || typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const next = mq.matches ? "dark" : "light";
      setResolved(next);
      apply(next);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [mode]);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    if (typeof window !== "undefined") {
      if (m === "system") window.localStorage.removeItem("theme");
      else window.localStorage.setItem("theme", m);
    }
    const next = m === "system" ? readSystem() : m;
    setResolved(next);
    apply(next);
  }, []);

  const toggle = useCallback(() => {
    setMode(resolved === "dark" ? "light" : "dark");
  }, [resolved, setMode]);

  return (
    <ThemeContext.Provider value={{ mode, resolved, setMode, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): Ctx {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme debe usarse dentro de <ThemeProvider>");
  return ctx;
}
