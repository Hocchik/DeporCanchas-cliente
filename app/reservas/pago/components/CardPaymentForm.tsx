"use client";

import { useState } from "react";

export type CardFormValues = {
  titular_nombre: string;
  titular_dni: string;
  titular_direccion: string;
  titular_fecha_nacimiento: string;
  numero: string;
  expiracion: string;
  cvv: string;
};

type Props = {
  onSubmit: (values: CardFormValues) => Promise<void>;
  disabled?: boolean;
};

const initial: CardFormValues = {
  titular_nombre: "", titular_dni: "", titular_direccion: "", titular_fecha_nacimiento: "",
  numero: "", expiracion: "", cvv: "",
};

function formatNumero(v: string) {
  const digits = v.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}
function formatExp(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}

export default function CardPaymentForm({ onSubmit, disabled }: Props) {
  const [v, setV] = useState<CardFormValues>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof CardFormValues, string>>>({});

  function setField<K extends keyof CardFormValues>(k: K, val: string) {
    setV((prev) => ({ ...prev, [k]: val }));
  }

  function validate(): boolean {
    const e: typeof errors = {};
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,}$/.test(v.titular_nombre.trim())) e.titular_nombre = "Nombre inválido";
    if (!/^\d{8}$/.test(v.titular_dni)) e.titular_dni = "DNI debe tener 8 dígitos";
    if (v.titular_direccion.trim().length < 5) e.titular_direccion = "Dirección requerida";
    if (!v.titular_fecha_nacimiento) e.titular_fecha_nacimiento = "Fecha requerida";
    else {
      const dob = new Date(v.titular_fecha_nacimiento);
      const now = new Date();
      let edad = now.getFullYear() - dob.getFullYear();
      const m = now.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) edad--;
      if (edad < 18) e.titular_fecha_nacimiento = "Debe ser mayor de 18";
    }
    const numLimpio = v.numero.replace(/\s/g, "");
    if (!/^\d{16}$/.test(numLimpio)) e.numero = "Número debe tener 16 dígitos";
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(v.expiracion)) e.expiracion = "Formato MM/AA";
    if (!/^\d{3}$/.test(v.cvv)) e.cvv = "CVV de 3 dígitos";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    await onSubmit({ ...v, numero: v.numero.replace(/\s/g, "") });
  }

  return (
    <div className="rounded-2xl bg-snow-white p-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Nombre del titular" error={errors.titular_nombre} className="md:col-span-2">
          <input type="text" value={v.titular_nombre}
            onChange={(e) => setField("titular_nombre", e.target.value)}
            className="w-full rounded-xl border border-stone-gray bg-stone-gray/30 px-4 py-3 text-main"
            placeholder="Nombre completo" />
        </Field>
        <Field label="DNI" error={errors.titular_dni}>
          <input type="text" inputMode="numeric" maxLength={8} value={v.titular_dni}
            onChange={(e) => setField("titular_dni", e.target.value.replace(/\D/g, ""))}
            className="w-full rounded-xl border border-stone-gray bg-stone-gray/30 px-4 py-3 text-main"
            placeholder="DNI 8 dígitos" />
        </Field>
        <Field label="Fecha de nacimiento" error={errors.titular_fecha_nacimiento}>
          <input type="date" value={v.titular_fecha_nacimiento}
            onChange={(e) => setField("titular_fecha_nacimiento", e.target.value)}
            className="w-full rounded-xl border border-stone-gray bg-stone-gray/30 px-4 py-3 text-main" />
        </Field>
        <Field label="Dirección" error={errors.titular_direccion} className="md:col-span-2">
          <input type="text" value={v.titular_direccion}
            onChange={(e) => setField("titular_direccion", e.target.value)}
            className="w-full rounded-xl border border-stone-gray bg-stone-gray/30 px-4 py-3 text-main"
            placeholder="Dirección completa" />
        </Field>
        <Field label="Número de tarjeta" error={errors.numero} className="md:col-span-2">
          <input type="text" inputMode="numeric" value={v.numero}
            onChange={(e) => setField("numero", formatNumero(e.target.value))}
            className="w-full rounded-xl border border-stone-gray bg-stone-gray/30 px-4 py-3 text-main"
            placeholder="0000 0000 0000 0000" />
        </Field>
        <Field label="Fecha de expiración" error={errors.expiracion}>
          <input type="text" inputMode="numeric" value={v.expiracion}
            onChange={(e) => setField("expiracion", formatExp(e.target.value))}
            className="w-full rounded-xl border border-stone-gray bg-stone-gray/30 px-4 py-3 text-main"
            placeholder="MM/AA" />
        </Field>
        <Field label="CVV" error={errors.cvv}>
          <input type="password" inputMode="numeric" maxLength={3} value={v.cvv}
            onChange={(e) => setField("cvv", e.target.value.replace(/\D/g, ""))}
            className="w-full rounded-xl border border-stone-gray bg-stone-gray/30 px-4 py-3 text-main"
            placeholder="***" />
        </Field>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={() => { setV(initial); setErrors({}); }}
          className="rounded-xl bg-stone-gray px-6 py-3 text-main">Limpiar</button>
        <button type="button" disabled={disabled} onClick={handleSubmit}
          className="rounded-xl bg-forest-green px-6 py-3 text-snow-white font-semibold disabled:opacity-50">
          Realizar Pago →
        </button>
      </div>
    </div>
  );
}

function Field({ label, error, className, children }: { label: string; error?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <label className="block text-sm text-main mb-2">{label}</label>
      {children}
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  );
}
