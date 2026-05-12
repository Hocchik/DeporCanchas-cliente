"use client";

import { useEffect, useState } from "react";

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
  return (
    <div className="rounded-xl bg-stone-gray/40 px-4 py-2 text-sm font-semibold text-main">
      Tiempo restante: {String(min).padStart(2, "0")}:{String(sec).padStart(2, "0")}
    </div>
  );
}
