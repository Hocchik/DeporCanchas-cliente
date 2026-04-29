"use client";
import React, { useEffect, useMemo, useState } from "react";

import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { createClient } from "../../lib/supabase/client";
import "../styles/colors.css";

export default function LoginForm({ onLogin }: { onLogin: (user: any) => void }) {
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepLogged, setKeepLogged] = useState(true);
  const [loading, setLoading] = useState(false);
  const [alreadyLoggedIn, setAlreadyLoggedIn] = useState(false);
  const [currentEmail, setCurrentEmail] = useState("");
  const supabase = useMemo(
    () => createClient({ persistSession: keepLogged }),
    [keepLogged]
  );

  useEffect(() => {
    let isMounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      const sessionEmail = data.session?.user?.email ?? "";
      if (sessionEmail) {
        setAlreadyLoggedIn(true);
        setCurrentEmail(sessionEmail);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: clave,
    });

    if (signInError) {
      setError("No se pudo iniciar sesion. Revisa tus datos.");
      setLoading(false);
      return;
    }

    onLogin(data.user);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {alreadyLoggedIn && (
        <div className="text-sm text-forest-green bg-[#eef7ea] border border-[#cfe2d5] rounded-md p-3">
          Ya estas conectado{currentEmail ? `: ${currentEmail}` : ""}.
        </div>
      )}
      {/* Correo electrónico */}
      <div>
        <label className="block mb-1 font-bold text-[1.15rem] text-forest-green">Correo Electrónico</label>
        <div className="flex items-center bg-[#efeeed] rounded-xl px-4 py-3 gap-3">
          <EnvelopeIcon className="w-6 h-6 text-forest-green" style={{ opacity: 0.6 }} />
          <input
            type="email"
            className="flex-1 bg-transparent border-none outline-none text-base font-semibold text-forest-green"
            placeholder="alex.rivera@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>
      {/* Contraseña */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="font-bold text-[1.15rem] text-forest-green">Contraseña</label>
          <a href="#" className="text-blue-600 text-sm font-semibold hover:underline">¿Olvidaste tu contraseña?</a>
        </div>
        <div className="flex items-center bg-[#efeeed] rounded-xl px-4 py-3 gap-3">
          <LockClosedIcon className="w-6 h-6 text-forest-green" style={{ opacity: 0.6 }} />
          <input
            type={showPassword ? 'text' : 'password'}
            className="flex-1 bg-transparent border-none outline-none text-base font-semibold tracking-widest text-forest-green"
            placeholder="••••••••"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            required
          />
          <button
            type="button"
            tabIndex={-1}
            className="focus:outline-none"
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? (
              <EyeSlashIcon className="w-6 h-6 text-forest-green" style={{ opacity: 0.6 }} />
            ) : (
              <EyeIcon className="w-6 h-6 text-forest-green" style={{ opacity: 0.6 }} />
            )}
          </button>
        </div>
      </div>
      {/* Mantener sesión iniciada */}
      <div className="flex items-center gap-2 mt-5 mb-5">
        <input
          id="keep-logged"
          type="checkbox"
          className="accent-forest-green"
          checked={keepLogged}
          onChange={(e) => setKeepLogged(e.target.checked)}
        />
        <label htmlFor="keep-logged" className="text-forest-green text-sm font-semibold select-none">Mantener sesión iniciada</label>
      </div>
      {error && <div className="text-danger text-sm">{error}</div>}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 font-semibold text-snow-white py-3 rounded-md shadow-md transition bg-gradient-to-r from-[#0056D0] to-[#88A9FF] hover:from-[#003a8c] hover:to-[#88A9FF]"
      >
        {loading ? "Ingresando..." : "Iniciar sesión"}
      </button>
    </form>
  );
}
