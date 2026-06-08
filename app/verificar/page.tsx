"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";

type State = "loading" | "ok" | "ya-verificado" | "invalido" | "vencido" | "error";

function VerificarInner() {
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = new URLSearchParams(window.location.search).get("token") ?? "";
    if (!token) {
      setState("invalido");
      return;
    }
    (async () => {
      try {
        const res = await fetch("/api/auth/verificar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setState(data.already ? "ya-verificado" : "ok");
          return;
        }
        if (data.error === "token_vencido") setState("vencido");
        else if (data.error === "token_invalido") setState("invalido");
        else setState("error");
      } catch {
        setState("error");
      }
    })();
  }, []);

  return (
    <main className="min-h-screen flex flex-col bg-app">
      <Navbar />
      <section className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md card-soft p-8 text-center space-y-4">
          {state === "loading" && (
            <>
              <p className="text-muted">Verificando tu correo…</p>
            </>
          )}
          {(state === "ok" || state === "ya-verificado") && (
            <>
              <div className="mx-auto w-14 h-14 rounded-full bg-brand text-on-brand inline-flex items-center justify-center">
                <CheckCircleIcon className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-display font-bold text-primary">
                {state === "ok" ? "¡Correo verificado!" : "Tu correo ya estaba verificado."}
              </h1>
              <p className="text-muted text-sm">
                Ya puedes reservar y completar pagos con tu cuenta.
              </p>
              <Link href="/reservas" className="btn-primary inline-flex">
                Ir a reservar
              </Link>
            </>
          )}
          {(state === "invalido" || state === "vencido" || state === "error") && (
            <>
              <div className="mx-auto w-14 h-14 rounded-full bg-danger-soft text-danger inline-flex items-center justify-center">
                <ExclamationTriangleIcon className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-display font-bold text-primary">
                {state === "vencido"
                  ? "El enlace caducó"
                  : state === "invalido"
                    ? "Enlace inválido"
                    : "Ocurrió un error"}
              </h1>
              <p className="text-muted text-sm">
                Inicia sesión y reenvía el correo desde el aviso superior. Si el problema persiste, contáctanos.
              </p>
              <Link href="/login" className="btn-primary inline-flex">
                Ir a iniciar sesión
              </Link>
            </>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}

export default function VerificarPage() {
  return (
    <Suspense fallback={<div />}>
      <VerificarInner />
    </Suspense>
  );
}
