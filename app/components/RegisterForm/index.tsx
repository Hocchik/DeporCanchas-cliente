"use client";
import React from "react";
import { ArrowRightIcon, UserIcon, EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, PhoneIcon } from '@heroicons/react/24/solid';
import { useRegister } from "./useRegister";

export default function RegisterForm({
  onRegister,
  redirectTo,
}: {
  onRegister?: (user: unknown) => void;
  redirectTo?: string | null;
} = {}) {
  const {
    nombre, setNombre,
    celular, setCelular,
    email, setEmail,
    clave, setClave,
    showPassword, setShowPassword,
    fieldErrors, setFieldErrors,
    handleSubmit
  } = useRegister({ onRegister, redirectTo });

  return (
    <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
      <Field label="Nombre completo" error={fieldErrors.nombre}>
        <FieldShell hasError={!!fieldErrors.nombre}>
          <UserIcon className="w-5 h-5 text-brand opacity-70 shrink-0" />
          <input
            type="text"
            name="registro_nombre"
            autoComplete="off"
            placeholder="Alex Rivera"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              if (fieldErrors.nombre) setFieldErrors(prev => ({ ...prev, nombre: undefined }));
            }}
            className="flex-1 bg-transparent border-none outline-none text-primary placeholder:text-soft text-base"
          />
        </FieldShell>
      </Field>

      <Field label="Correo electrónico" error={fieldErrors.email}>
        <FieldShell hasError={!!fieldErrors.email}>
          <EnvelopeIcon className="w-5 h-5 text-brand opacity-70 shrink-0" />
          <input
            type="email"
            name="registro_email"
            autoComplete="off"
            placeholder="alex.rivera@gmail.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: undefined }));
            }}
            className="flex-1 bg-transparent border-none outline-none text-primary placeholder:text-soft text-base"
          />
        </FieldShell>
      </Field>

      <Field label="Celular" error={fieldErrors.celular}>
        <FieldShell hasError={!!fieldErrors.celular}>
          <PhoneIcon className="w-5 h-5 text-brand opacity-70 shrink-0" />
          <input
            type="tel"
            inputMode="numeric"
            maxLength={9}
            name="registro_celular"
            autoComplete="off"
            placeholder="987654321"
            value={celular}
            onChange={(e) => {
              setCelular(e.target.value.replace(/\D/g, "").slice(0, 9));
              if (fieldErrors.celular) setFieldErrors(prev => ({ ...prev, celular: undefined }));
            }}
            className="flex-1 bg-transparent border-none outline-none text-primary placeholder:text-soft text-base"
          />
        </FieldShell>
      </Field>

      <Field
        label="Contraseña"
        error={fieldErrors.clave}
        hint="Mínimo 8 caracteres, 1 mayúscula, 1 minúscula y 1 número."
      >
        <FieldShell hasError={!!fieldErrors.clave}>
          <LockClosedIcon className="w-5 h-5 text-brand opacity-70 shrink-0" />
          <input
            type={showPassword ? 'text' : 'password'}
            name="registro_password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={clave}
            onChange={(e) => {
              setClave(e.target.value);
              if (fieldErrors.clave) setFieldErrors(prev => ({ ...prev, clave: undefined }));
            }}
            className="flex-1 bg-transparent border-none outline-none text-primary placeholder:text-soft text-base tracking-widest"
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            className="text-soft hover:text-brand transition shrink-0"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
          </button>
        </FieldShell>
      </Field>

      <button type="submit" className="btn-primary w-full mt-2">
        Crear cuenta
        <ArrowRightIcon className="w-4 h-4" />
      </button>

      <p className="text-xs text-soft text-center">
        Al registrarte aceptas nuestros{" "}
        <a href="#" className="text-brand hover:underline">Términos</a> y{" "}
        <a href="#" className="text-brand hover:underline">Política de Privacidad</a>.
      </p>
    </form>
  );
}

function Field({
  label, error, hint, children,
}: {
  label: string; error?: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block mb-1.5 text-sm font-semibold text-primary">{label}</label>
      {children}
      {error ? (
        <p className="text-red-500 text-xs mt-1.5 ml-1">{error}</p>
      ) : hint ? (
        <p className="text-soft text-xs mt-1.5 ml-1">{hint}</p>
      ) : null}
    </div>
  );
}

function FieldShell({ hasError, children }: { hasError?: boolean; children: React.ReactNode }) {
  return (
    <div
      className={[
        "flex items-center gap-3 rounded-xl px-4 py-3 border bg-surface-alt transition",
        hasError ? "border-red-400" : "border-default focus-within:border-strong focus-within:bg-surface",
      ].join(" ")}
    >
      {children}
    </div>
  );
}
