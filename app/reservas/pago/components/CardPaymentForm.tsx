"use client";

import { useState } from "react";
import { CreditCardIcon, LockClosedIcon, ShieldCheckIcon } from "@heroicons/react/24/solid";

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
function brandFromNumber(numero: string): string {
  const n = numero.replace(/\s/g, "");
  if (n.startsWith("4")) return "VISA";
  if (/^5[1-5]/.test(n) || /^2(2[2-9]|[3-6]|7[01]|720)/.test(n)) return "MASTERCARD";
  if (/^3[47]/.test(n)) return "AMEX";
  return "";
}

export default function CardPaymentForm({ onSubmit, disabled }: Props) {
  const [v, setV] = useState<CardFormValues>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof CardFormValues, string>>>({});

  function setField<K extends keyof CardFormValues>(k: K, val: string) {
    setV((prev) => ({ ...prev, [k]: val }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: undefined }));
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

  const brand = brandFromNumber(v.numero);

  return (
    <div className="card-soft p-5 md:p-6">
      <div className="flex items-center gap-2 mb-5">
        <CreditCardIcon className="w-5 h-5 text-brand" />
        <h3 className="font-display font-semibold text-base text-primary">Datos de tarjeta</h3>
        <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted">
          <ShieldCheckIcon className="w-3.5 h-3.5" />
          Pago seguro
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Nombre del titular" error={errors.titular_nombre} className="md:col-span-2">
          <Input value={v.titular_nombre} onChange={(s) => setField("titular_nombre", s)} placeholder="Nombre completo" />
        </Field>
        <Field label="DNI" error={errors.titular_dni}>
          <Input value={v.titular_dni} onChange={(s) => setField("titular_dni", s.replace(/\D/g, "").slice(0, 8))} placeholder="DNI 8 dígitos" inputMode="numeric" maxLength={8} />
        </Field>
        <Field label="Fecha de nacimiento" error={errors.titular_fecha_nacimiento}>
          <Input type="date" value={v.titular_fecha_nacimiento} onChange={(s) => setField("titular_fecha_nacimiento", s)} />
        </Field>
        <Field label="Dirección" error={errors.titular_direccion} className="md:col-span-2">
          <Input value={v.titular_direccion} onChange={(s) => setField("titular_direccion", s)} placeholder="Av. Test 123, Lima" />
        </Field>

        <Field label="Número de tarjeta" error={errors.numero} className="md:col-span-2">
          <div className="relative">
            <Input value={v.numero} onChange={(s) => setField("numero", formatNumero(s))} placeholder="0000 0000 0000 0000" inputMode="numeric" />
            {brand && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-brand bg-brand-soft px-2 py-1 rounded-md">
                {brand}
              </span>
            )}
          </div>
        </Field>
        <Field label="Expiración" error={errors.expiracion}>
          <Input value={v.expiracion} onChange={(s) => setField("expiracion", formatExp(s))} placeholder="MM/AA" inputMode="numeric" />
        </Field>
        <Field label="CVV" error={errors.cvv}>
          <div className="relative">
            <Input type="password" value={v.cvv} onChange={(s) => setField("cvv", s.replace(/\D/g, "").slice(0, 3))} placeholder="•••" inputMode="numeric" maxLength={3} />
            <LockClosedIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soft" />
          </div>
        </Field>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={() => { setV(initial); setErrors({}); }} className="btn-secondary !py-2.5 !px-5">
          Limpiar
        </button>
        <button type="button" disabled={disabled} onClick={handleSubmit} className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed">
          Realizar pago →
        </button>
      </div>
    </div>
  );
}

function Field({ label, error, className, children }: { label: string; error?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <label className="block text-xs font-semibold text-primary mb-1.5">{label}</label>
      {children}
      {error && <p className="text-danger text-xs mt-1.5 ml-1">{error}</p>}
    </div>
  );
}

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & {
  value: string;
  onChange: (s: string) => void;
};

function Input({ onChange, value, ...rest }: InputProps) {
  return (
    <input
      {...rest}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-default bg-surface-alt focus:bg-surface focus:border-strong outline-none px-4 py-3 text-primary placeholder:text-soft transition"
    />
  );
}
