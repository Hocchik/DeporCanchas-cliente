"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PasswordStrength from "../components/PasswordStrength";
import {
  ArrowRightIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/solid";

type Step = "email" | "codigo" | "clave" | "ok";

const RESEND_FALLBACK_SECONDS = 60;

export default function RecuperarPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Tick para el contador de reenvío
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (cooldown <= 0) {
      if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
      return;
    }
    if (tickRef.current) return;
    tickRef.current = setInterval(() => {
      setCooldown((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => {
      if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
    };
  }, [cooldown]);

  // ---- Paso 1: pedir código ----
  const requestCode = async () => {
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/recuperar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 429) {
        // Bajo cooldown / rate-limit
        const wait = Number(data?.wait_seconds ?? RESEND_FALLBACK_SECONDS);
        setError(`Espera ${wait} s antes de pedir otro código.`);
        setCooldown(wait);
        return false;
      }
      if (!res.ok) {
        setError("No se pudo enviar el código. Inténtalo de nuevo.");
        return false;
      }
      const cd = Number(data?.cooldown_seconds ?? RESEND_FALLBACK_SECONDS);
      setCooldown(cd);
      return true;
    } catch {
      setError("Error de red.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const ok = await requestCode();
    if (ok) {
      setStep("codigo");
      setInfo(`Te enviamos un código de 6 dígitos a ${email}. Revisa tu bandeja (y spam).`);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || loading) return;
    const ok = await requestCode();
    if (ok) setInfo("Te enviamos un nuevo código.");
  };

  // ---- Paso 2: verificar código ----
  const handleSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!/^\d{6}$/.test(code)) {
      setError("El código debe tener 6 dígitos.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/recuperar/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, codigo: code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const map: Record<string, string> = {
          codigo_invalido: data?.intentos_restantes != null
            ? `Código incorrecto. Te quedan ${data.intentos_restantes} intentos.`
            : "Código incorrecto.",
          codigo_vencido: "El código caducó. Solicita uno nuevo.",
          demasiados_intentos: "Demasiados intentos fallidos. Solicita un nuevo código en unos minutos.",
          datos_invalidos: "Revisa los datos.",
        };
        setError(map[data?.error as string] ?? "No se pudo verificar el código.");
        return;
      }
      setResetToken(String(data.reset_token));
      setStep("clave");
    } catch {
      setError("Error de red.");
    } finally {
      setLoading(false);
    }
  };

  // ---- Paso 3: nueva contraseña ----
  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$/.test(password)) {
      setError("Mínimo 8 caracteres, 1 mayúscula, 1 minúscula y 1 número.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/restablecer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reset_token: resetToken, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const map: Record<string, string> = {
          token_invalido: "Sesión de recuperación inválida. Reinicia el proceso.",
          token_usado: "Este código ya fue usado. Solicita uno nuevo.",
          token_vencido: "La sesión de recuperación caducó. Reinicia el proceso.",
          password_corta: data.detail || "Contraseña demasiado corta.",
        };
        setError(map[data?.error as string] ?? "No se pudo restablecer la contraseña.");
        return;
      }
      setStep("ok");
      setTimeout(() => router.push("/login"), 2500);
    } catch {
      setError("Error de red.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-app">
      <Navbar />
      <section className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <p className="text-eyebrow text-brand mb-3">Acceso</p>
            <h1 className="text-display-lg mb-2">
              {step === "email" && "¿Olvidaste tu contraseña?"}
              {step === "codigo" && "Verifica tu código"}
              {step === "clave" && "Crear nueva contraseña"}
              {step === "ok" && "¡Listo!"}
            </h1>
            <p className="text-muted text-sm">
              {step === "email" && "Ingresa tu correo y te enviaremos un código de 6 dígitos."}
              {step === "codigo" && `Escribe el código que enviamos a ${email}.`}
              {step === "clave" && "Elige una contraseña segura para tu cuenta."}
              {step === "ok" && "Te llevamos al inicio de sesión..."}
            </p>
          </div>

          <div className="card-soft p-6 md:p-7">
            {/* Paso 1: email */}
            {step === "email" && (
              <form onSubmit={handleSubmitEmail} className="space-y-4">
                <div>
                  <label className="block mb-1.5 text-sm font-semibold text-primary">Correo electrónico</label>
                  <div className="flex items-center gap-3 rounded-xl px-4 py-3 border bg-surface-alt border-default focus-within:border-strong focus-within:bg-surface">
                    <EnvelopeIcon className="w-5 h-5 text-brand opacity-70 shrink-0" />
                    <input
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex.rivera@gmail.com"
                      className="flex-1 bg-transparent border-none outline-none text-primary placeholder:text-soft text-base"
                    />
                  </div>
                </div>

                {error && <p className="text-danger text-sm">{error}</p>}

                <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                  {loading ? "Enviando..." : "Enviar código"}
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
                <p className="text-sm text-muted text-center">
                  <Link href="/login" className="font-semibold text-brand hover:underline">
                    Volver al inicio de sesión
                  </Link>
                </p>
              </form>
            )}

            {/* Paso 2: código */}
            {step === "codigo" && (
              <form onSubmit={handleSubmitCode} className="space-y-4">
                <div>
                  <label className="block mb-1.5 text-sm font-semibold text-primary">Código de verificación</label>
                  <div className="flex items-center gap-3 rounded-xl px-4 py-3 border bg-surface-alt border-default focus-within:border-strong focus-within:bg-surface">
                    <ShieldCheckIcon className="w-5 h-5 text-brand opacity-70 shrink-0" />
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="\d{6}"
                      maxLength={6}
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="000000"
                      className="flex-1 bg-transparent border-none outline-none text-primary placeholder:text-soft text-2xl tracking-[0.5em] font-mono"
                    />
                  </div>
                </div>

                {info && <p className="text-sm text-muted">{info}</p>}
                {error && <p className="text-danger text-sm">{error}</p>}

                <button type="submit" disabled={loading || code.length !== 6} className="btn-primary w-full mt-2">
                  {loading ? "Verificando..." : "Verificar código"}
                  <ArrowRightIcon className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => { setStep("email"); setCode(""); setError(null); setInfo(null); }}
                    className="text-muted hover:text-primary"
                  >
                    ← Cambiar correo
                  </button>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={cooldown > 0 || loading}
                    className="font-semibold text-brand hover:underline disabled:text-soft disabled:no-underline disabled:cursor-not-allowed"
                  >
                    {cooldown > 0 ? `Reenviar en ${cooldown}s` : "Reenviar código"}
                  </button>
                </div>
              </form>
            )}

            {/* Paso 3: nueva contraseña */}
            {step === "clave" && (
              <form onSubmit={handleSubmitPassword} className="space-y-4">
                <div>
                  <label className="block mb-1.5 text-sm font-semibold text-primary">Nueva contraseña</label>
                  <div className="flex items-center gap-3 rounded-xl px-4 py-3 border bg-surface-alt border-default focus-within:border-strong focus-within:bg-surface">
                    <LockClosedIcon className="w-5 h-5 text-brand opacity-70 shrink-0" />
                    <input
                      type={showPass ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="flex-1 bg-transparent border-none outline-none text-primary placeholder:text-soft text-base tracking-widest"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPass((v) => !v)}
                      className="text-soft hover:text-brand transition shrink-0"
                      aria-label={showPass ? "Ocultar" : "Mostrar"}
                    >
                      {showPass ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                  <PasswordStrength value={password} />
                  <p className="text-soft text-xs mt-1.5 ml-1">
                    Mínimo 8 caracteres, 1 mayúscula, 1 minúscula y 1 número.
                  </p>
                </div>

                <div>
                  <label className="block mb-1.5 text-sm font-semibold text-primary">Confirmar contraseña</label>
                  <div className="flex items-center gap-3 rounded-xl px-4 py-3 border bg-surface-alt border-default focus-within:border-strong focus-within:bg-surface">
                    <LockClosedIcon className="w-5 h-5 text-brand opacity-70 shrink-0" />
                    <input
                      type={showPass ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="••••••••"
                      className="flex-1 bg-transparent border-none outline-none text-primary placeholder:text-soft text-base tracking-widest"
                    />
                  </div>
                </div>

                {error && <p className="text-danger text-sm">{error}</p>}

                <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                  {loading ? "Guardando..." : "Restablecer contraseña"}
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Paso final */}
            {step === "ok" && (
              <div className="text-center space-y-3 py-4">
                <p className="text-primary font-semibold">¡Contraseña actualizada!</p>
                <p className="text-sm text-muted">Te redirigimos al inicio de sesión...</p>
              </div>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
