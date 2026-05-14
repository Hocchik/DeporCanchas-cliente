"use client";

import { useState } from "react";
import { XMarkIcon, SparklesIcon } from "@heroicons/react/24/solid";
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-3xl bg-surface-elev border border-default p-6 md:p-7 shadow-floating max-h-[92vh] overflow-y-auto animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <span className="chip mb-2 inline-flex">
              <SparklesIcon className="w-3.5 h-3.5" />
              {tab === "login" ? "Bienvenido de nuevo" : "Únete"}
            </span>
            <h2 className="font-display font-bold text-xl text-primary">
              {tab === "login" ? title : "Crea tu cuenta"}
            </h2>
            <p className="text-sm text-muted mt-1">
              {tab === "login" ? subtitle : "Es gratis. Toma menos de un minuto."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-default text-muted hover:text-primary hover:border-strong transition shrink-0"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="inline-flex items-center gap-1 rounded-full bg-surface-alt p-1 border border-soft mb-5">
          <TabBtn active={tab === "login"} onClick={() => setTab("login")}>
            Iniciar sesión
          </TabBtn>
          <TabBtn active={tab === "register"} onClick={() => setTab("register")}>
            Registrarse
          </TabBtn>
        </div>

        {tab === "login" ? (
          <LoginForm onLogin={onAuthSuccess} redirectTo={null} />
        ) : (
          <RegisterForm onRegister={onAuthSuccess} redirectTo={null} />
        )}
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "px-4 py-2 text-sm font-semibold rounded-full transition",
        active ? "bg-surface text-brand shadow-soft" : "text-muted hover:text-primary",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
