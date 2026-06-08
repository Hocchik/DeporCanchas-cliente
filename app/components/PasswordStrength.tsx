"use client";

/**
 * Barra de fortaleza de contraseña (3 segmentos).
 * Score 0–4 según longitud (≥8, ≥12) y variedad (mayús/minús/dígito/símbolo).
 */

type Strength = "vacia" | "debil" | "media" | "fuerte";

const COLORS: Record<Strength, [string, string, string]> = {
  // bg de los 3 segmentos (1 → 3)
  vacia:  ["bg-soft", "bg-soft", "bg-soft"],
  debil:  ["bg-red-500", "bg-soft", "bg-soft"],
  media:  ["bg-amber-500", "bg-amber-500", "bg-soft"],
  fuerte: ["bg-emerald-600", "bg-emerald-600", "bg-emerald-600"],
};

const LABELS: Record<Strength, string> = {
  vacia: "",
  debil: "Débil",
  media: "Media",
  fuerte: "Fuerte",
};

function score(pwd: string): Strength {
  if (!pwd) return "vacia";
  const len = pwd.length;
  const variety =
    Number(/[a-z]/.test(pwd)) +
    Number(/[A-Z]/.test(pwd)) +
    Number(/[0-9]/.test(pwd)) +
    Number(/[^A-Za-z0-9]/.test(pwd));
  if (len < 8 || variety < 2) return "debil";
  if (len < 12 || variety < 3) return "media";
  return "fuerte";
}

export default function PasswordStrength({ value }: { value: string }) {
  const s = score(value);
  const [c1, c2, c3] = COLORS[s];
  return (
    <div className="mt-1.5">
      <div className="flex gap-1.5">
        <span className={`h-1.5 flex-1 rounded-full transition-colors ${c1}`} />
        <span className={`h-1.5 flex-1 rounded-full transition-colors ${c2}`} />
        <span className={`h-1.5 flex-1 rounded-full transition-colors ${c3}`} />
      </div>
      {s !== "vacia" && (
        <p
          className={`text-[11px] mt-1 font-semibold ${
            s === "fuerte" ? "text-emerald-700 dark:text-emerald-400"
            : s === "media" ? "text-amber-700 dark:text-amber-400"
            : "text-red-600 dark:text-red-400"
          }`}
        >
          Fortaleza: {LABELS[s]}
        </p>
      )}
    </div>
  );
}
