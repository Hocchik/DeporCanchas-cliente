"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { EnvelopeIcon, ArrowRightIcon } from "@heroicons/react/24/solid";

export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/auth/recuperar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      // Por privacidad, mostramos siempre el mismo mensaje, exista o no el email.
      setSent(true);
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
            <h1 className="text-display-lg mb-2">¿Olvidaste tu contraseña?</h1>
            <p className="text-muted text-sm">
              Ingresa tu correo y te enviaremos un enlace para crear una nueva.
            </p>
          </div>

          <div className="card-soft p-6 md:p-7">
            {sent ? (
              <div className="text-center space-y-4">
                <p className="text-primary">
                  Si <span className="font-semibold">{email}</span> está registrado, te enviamos un correo con un enlace.
                </p>
                <p className="text-sm text-muted">
                  El enlace caduca en 30 minutos. Revisa tu bandeja de entrada (y spam).
                </p>
                <Link href="/login" className="btn-primary inline-flex">
                  Volver al inicio de sesión
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1.5 text-sm font-semibold text-primary">
                    Correo electrónico
                  </label>
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
                <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                  {loading ? "Enviando..." : "Enviar enlace"}
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
                <p className="text-sm text-muted text-center">
                  <Link href="/login" className="font-semibold text-brand hover:underline">
                    Volver al inicio de sesión
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
