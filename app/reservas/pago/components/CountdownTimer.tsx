"use client";

import { useEffect, useState } from "react";
import { ClockIcon } from "@heroicons/react/24/solid";

type Props = { expiresAt: string; onExpire: () => void };

export default function CountdownTimer({ expiresAt, onExpire }: Props) {
  const [remaining, setRemaining] = useState(() => Math.max(0, new Date(expiresAt).getTime() - Date.now()));

  useEffect(() => {
    const id = setInterval(() => {
      const ms = Math.max(0, new Date(expiresAt).getTime() - Date.now());
      setRemaining(ms);
      if (ms === 0) { clearInterval(id); onExpire(); }
    }, 1000);
    return () => clearInterval(id);
  }, [expiresAt, onExpire]);

  const min = Math.floor(remaining / 60000);
  const sec = Math.floor((remaining % 60000) / 1000);
  const isLow = remaining < 2 * 60 * 1000;

  return (
    <div className={[
      "inline-flex items-center gap-2 rounded-full px-4 py-2 border text-sm font-semibold transition",
      isLow
        ? "bg-danger-soft border-danger-soft text-danger animate-pulse-soft"
        : "bg-brand-soft border-soft text-brand",
    ].join(" ")}>
      <ClockIcon className="w-4 h-4" />
      <span className="font-display tabular-nums">
        {String(min).padStart(2, "0")}:{String(sec).padStart(2, "0")}
      </span>
      <span className="text-xs font-medium opacity-80 hidden sm:inline">
        para confirmar
      </span>
    </div>
  );
}
