"use client";
import React from "react";
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { useLogin } from "./useLogin";

export default function LoginForm({
  onLogin,
  redirectTo,
}: {
  onLogin?: (user: unknown) => void;
  redirectTo?: string | null;
}) {
  const {
    email, setEmail,
    clave, setClave,
    showPassword, setShowPassword,
    keepLogged, setKeepLogged,
    alreadyLoggedIn, currentEmail,
    fieldErrors, setFieldErrors,
    handleSubmit,
  } = useLogin({ onLogin, redirectTo });

  return (
    <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
      {alreadyLoggedIn && (
        <div className="rounded-xl bg-brand-soft border border-default px-4 py-3 text-sm text-brand">
          Ya estás conectado{currentEmail ? `: ${currentEmail}` : ""}.
        </div>
      )}

      <Field label="Correo electrónico" error={fieldErrors.email}>
        <FieldShell hasError={!!fieldErrors.email}>
          <EnvelopeIcon className="w-5 h-5 text-brand opacity-70 shrink-0" />
          <input
            type="email"
            name="login_email"
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

      <Field
        label="Contraseña"
        error={fieldErrors.clave}
        right={<a href="#" className="text-xs font-medium text-brand hover:underline">¿Olvidaste tu contraseña?</a>}
      >
        <FieldShell hasError={!!fieldErrors.clave}>
          <LockClosedIcon className="w-5 h-5 text-brand opacity-70 shrink-0" />
          <input
            type={showPassword ? 'text' : 'password'}
            name="login_password"
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

      <label className="flex items-center gap-2 text-sm text-muted cursor-pointer select-none">
        <input
          id="keep-logged"
          type="checkbox"
          className="accent-[var(--brand)] w-4 h-4"
          checked={keepLogged}
          onChange={(e) => setKeepLogged(e.target.checked)}
        />
        Mantener sesión iniciada
      </label>

      <button type="submit" className="btn-primary w-full mt-2">
        Iniciar sesión
        <ArrowRightIcon className="w-4 h-4" />
      </button>
    </form>
  );
}

function Field({
  label, error, right, children,
}: {
  label: string; error?: string; right?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-semibold text-primary">{label}</label>
        {right}
      </div>
      {children}
      {error && <p className="text-red-500 text-xs mt-1.5 ml-1">{error}</p>}
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
