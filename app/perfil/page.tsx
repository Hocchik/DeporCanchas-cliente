"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightOnRectangleIcon, CheckCircleIcon, ChevronDownIcon, EyeIcon, EyeSlashIcon, IdentificationIcon } from "@heroicons/react/24/solid";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PasswordStrength from "../components/PasswordStrength";
import { useSession } from "../contexts/SessionContext";

export default function PerfilPage() {
  const router = useRouter();
  const { user, loading, refresh, logout } = useSession();

  const [datos, setDatos] = useState({ nombre: "", email: "", celular: "" });
  const [savingDatos, setSavingDatos] = useState(false);
  const [datosMsg, setDatosMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const [showPwd, setShowPwd] = useState(false);
  const [pwd, setPwd] = useState({ actual: "", nueva: "", confirmar: "" });
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login?next=/perfil");
  }, [loading, user, router]);

  useEffect(() => {
    if (user) setDatos({ nombre: user.nombre, email: user.email, celular: user.celular ?? "" });
  }, [user]);

  if (loading || !user) return null;

  const initials = user.nombre.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  async function saveDatos() {
    setSavingDatos(true);
    setDatosMsg(null);
    const res = await fetch("/api/perfil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
    setSavingDatos(false);
    if (res.ok) {
      setDatosMsg({ kind: "ok", text: "Datos actualizados" });
      refresh();
    } else {
      const j = await res.json().catch(() => ({}));
      setDatosMsg({ kind: "error", text: j.error === "email_ya_usado" ? "Ese email ya está en uso" : "Error al actualizar" });
    }
  }

  async function savePwd() {
    setPwdMsg(null);
    if (!pwd.actual) { setPwdMsg({ kind: "error", text: "Ingresa tu clave actual" }); return; }
    if (pwd.nueva.length < 8) { setPwdMsg({ kind: "error", text: "La clave nueva debe tener mínimo 8 caracteres" }); return; }
    if (pwd.nueva !== pwd.confirmar) { setPwdMsg({ kind: "error", text: "La nueva clave y la confirmación no coinciden" }); return; }
    setSavingPwd(true);
    const res = await fetch("/api/perfil/clave", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clave_actual: pwd.actual, clave_nueva: pwd.nueva }),
    });
    setSavingPwd(false);
    if (res.ok) {
      setPwdMsg({ kind: "ok", text: "Clave actualizada correctamente" });
      setPwd({ actual: "", nueva: "", confirmar: "" });
      // Dejamos el panel abierto para que se vea el mensaje de éxito.
    } else {
      const j = await res.json().catch(() => ({}));
      const msg =
        j.error === "clave_actual_invalida"
          ? "La clave actual es incorrecta"
          : j.error === "validation"
            ? "Datos inválidos. Revisa los campos."
            : "Error al actualizar la clave";
      setPwdMsg({ kind: "error", text: msg });
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-app">
      <Navbar />
      <section className="flex-1 max-w-2xl mx-auto px-4 md:px-6 py-8 md:py-12 w-full">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-brand text-on-brand flex items-center justify-center text-xl font-display font-bold shadow-card">
              {initials}
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-accent border-2 border-app flex items-center justify-center">
              <CheckCircleIcon className="w-3 h-3 text-brand" />
            </span>
          </div>
          <div>
            <p className="text-eyebrow text-brand mb-1">Mi cuenta</p>
            <h1 className="text-display-md text-primary">{user.nombre}</h1>
            <p className="text-sm text-muted">{user.email}</p>
          </div>
        </div>

        {/* Datos personales */}
        <Section title="Datos personales" subtitle="Mantén tu información al día.">
          <div className="space-y-4">
            <Field label="Nombre">
              <Input value={datos.nombre} onChange={(s) => setDatos({ ...datos, nombre: s })} placeholder="Tu nombre" />
            </Field>
            <Field label="Email">
              <Input type="email" value={datos.email} onChange={(s) => setDatos({ ...datos, email: s })} placeholder="tu@email.com" />
            </Field>
            <Field
              label="DNI"
              hint="Se registra automáticamente cuando pagas con tarjeta."
            >
              <div className="flex items-center gap-3 rounded-xl border border-default bg-surface-alt opacity-70 px-4 py-3">
                <IdentificationIcon className="w-4 h-4 text-brand opacity-70" />
                <span className="text-primary font-mono">{user.dni ?? "—"}</span>
              </div>
            </Field>
            <Field label="Celular">
              <Input
                inputMode="numeric"
                value={datos.celular}
                onChange={(s) => setDatos({ ...datos, celular: s.replace(/\D/g, "").slice(0, 9) })}
                placeholder="987654321"
                maxLength={9}
              />
            </Field>
            {datosMsg && (
              <p className={`text-sm ${datosMsg.kind === "ok" ? "text-brand" : "text-danger"}`}>
                {datosMsg.text}
              </p>
            )}
            <button type="button" onClick={saveDatos} disabled={savingDatos} className="btn-primary disabled:opacity-50">
              {savingDatos ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </Section>

        {/* Cambiar clave */}
        <Section
          title="Seguridad"
          subtitle="Actualiza tu clave de acceso."
          collapsibleHeader={
            <button
              type="button"
              onClick={() => setShowPwd((s) => !s)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
            >
              {showPwd ? "Ocultar" : "Cambiar clave"}
              <ChevronDownIcon className={`w-4 h-4 transition-transform ${showPwd ? "rotate-180" : ""}`} />
            </button>
          }
        >
          {showPwd && (
            <div className="space-y-4">
              <Field label="Clave actual">
                <PasswordInput value={pwd.actual} onChange={(s) => setPwd({ ...pwd, actual: s })} autoComplete="current-password" />
              </Field>
              <Field label="Clave nueva" hint="Mínimo 8 caracteres.">
                <PasswordInput value={pwd.nueva} onChange={(s) => setPwd({ ...pwd, nueva: s })} autoComplete="new-password" />
                <PasswordStrength value={pwd.nueva} />
              </Field>
              <Field label="Confirmar clave nueva">
                <PasswordInput value={pwd.confirmar} onChange={(s) => setPwd({ ...pwd, confirmar: s })} autoComplete="new-password" />
              </Field>
              {pwdMsg && (
                <p className={`text-sm ${pwdMsg.kind === "ok" ? "text-brand" : "text-danger"}`}>
                  {pwdMsg.text}
                </p>
              )}
              <button type="button" onClick={savePwd} disabled={savingPwd} className="btn-primary disabled:opacity-50">
                {savingPwd ? "Guardando…" : "Actualizar clave"}
              </button>
            </div>
          )}
        </Section>

        {/* Cuenta */}
        <Section title="Cuenta" subtitle="Cierra tu sesión actual.">
          <button
            type="button"
            onClick={async () => { await logout(); router.push("/"); }}
            className="inline-flex items-center gap-2 rounded-xl border border-danger-soft bg-danger-soft px-5 py-3 text-danger font-semibold hover:opacity-90 transition"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
            Cerrar sesión
          </button>
        </Section>
      </section>
      <Footer />
    </main>
  );
}

function Section({ title, subtitle, collapsibleHeader, children }: {
  title: string; subtitle?: string; collapsibleHeader?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <section className="card-soft p-6 mb-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="font-display font-semibold text-lg text-primary">{title}</h2>
          {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
        </div>
        {collapsibleHeader}
      </div>
      {children}
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-primary mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-soft mt-1.5 ml-1">{hint}</p>}
    </div>
  );
}

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & {
  value: string;
  onChange: (s: string) => void;
};

function Input({ value, onChange, ...rest }: InputProps) {
  return (
    <input
      {...rest}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-default bg-surface-alt focus:bg-surface focus:border-strong outline-none px-4 py-3 text-primary placeholder:text-soft transition"
    />
  );
}

function PasswordInput({ value, onChange, autoComplete }: { value: string; onChange: (s: string) => void; autoComplete?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-default bg-surface-alt focus:bg-surface focus:border-strong outline-none pl-4 pr-12 py-3 text-primary placeholder:text-soft transition"
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Ocultar clave" : "Mostrar clave"}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-muted hover:text-brand hover:bg-surface transition"
      >
        {show ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
      </button>
    </div>
  );
}
