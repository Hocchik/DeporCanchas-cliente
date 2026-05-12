"use client";

import { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

type Props = {
  open: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
  title?: string;
  subtitle?: string;
};

export default function AuthModal({
  open,
  onClose,
  onAuthSuccess,
  title = "Inicia sesión para continuar",
  subtitle = "Necesitas una cuenta activa para reservar y pagar.",
}: Props) {
  const [tab, setTab] = useState<"login" | "register">("login");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-snow-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-main">{title}</h2>
            <p className="text-sm text-main">{subtitle}</p>
          </div>
          <button
            type="button"
            className="text-2xl text-main"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="mt-5 inline-flex rounded-full bg-stone-gray p-1">
          <button
            type="button"
            onClick={() => setTab("login")}
            className={`px-4 py-2 text-sm font-semibold rounded-full transition border ${
              tab === "login"
                ? "bg-snow-white text-main border-stone-gray"
                : "text-main border-transparent opacity-70"
            }`}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => setTab("register")}
            className={`px-4 py-2 text-sm font-semibold rounded-full transition border ${
              tab === "register"
                ? "bg-snow-white text-main border-stone-gray"
                : "text-main border-transparent opacity-70"
            }`}
          >
            Registrarse
          </button>
        </div>

        <div className="mt-6">
          {tab === "login" ? (
            <LoginForm onLogin={onAuthSuccess} redirectTo={null} />
          ) : (
            <RegisterForm onRegister={onAuthSuccess} redirectTo={null} />
          )}
        </div>
      </div>
    </div>
  );
}
