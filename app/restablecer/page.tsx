"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { LockClosedIcon, EyeIcon, EyeSlashIcon, ArrowRightIcon } from "@heroicons/react/24/solid";

function RestablecerInner() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const map: Record<string, string> = {
          token_invalido: "El enlace no es válido.",
          token_usado: "Este enlace ya fue usado. Solicita uno nuevo.",
          token_vencido: "El enlace caducó. Solicita uno nuevo.",
          password_corta: data.detail || "Contraseña demasiado corta.",
        };
        setError(map[data.error as string] ?? data.error ?? "No se pudo restablecer.");
        return;
      }
      setDone(true);
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
            <h1 className="text-display-lg mb-2">Crear nueva contraseña</h1>
            <p className="text-muted text-sm">
              Elige una contraseña segura para tu cuenta.
            </p>
          </div>

          <div className="card-soft p-6 md:p-7">
            {!token ? (
              <div className="text-center space-y-4">
                <p className="text-danger">El enlace no tiene token.</p>
                <Link href="/recuperar" className="font-semibold text-brand hover:underline">
                  Solicitar uno nuevo
                </Link>
              </div>
            ) : done ? (
              <div className="text-center space-y-3">
                <p className="text-primary font-semibold">¡Contraseña actualizada!</p>
                <p className="text-sm text-muted">Te redirigimos al inicio de sesión...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1.5 text-sm font-semibold text-primary">
                    Nueva contraseña
                  </label>
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
                  <p className="text-soft text-xs mt-1.5 ml-1">
                    Mínimo 8 caracteres, 1 mayúscula, 1 minúscula y 1 número.
                  </p>
                </div>

                <div>
                  <label className="block mb-1.5 text-sm font-semibold text-primary">
                    Confirmar contraseña
                  </label>
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
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

export default function RestablecerPage() {
  return (
    <Suspense fallback={<div />}>
      <RestablecerInner />
    </Suspense>
  );
}
