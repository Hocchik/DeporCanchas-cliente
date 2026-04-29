"use client";
import React, { useMemo, useState } from "react";
import { ArrowRightIcon, UserIcon, EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { createClient } from "../../lib/supabase/client";
import { useRouter } from "next/navigation";
import "../styles/colors.css";

export default function RegisterForm() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password: clave,
      options: {
        data: {
          nombre,
          apellido,
        },
      },
    });

    if (signUpError) {
      setError("No se pudo registrar. Revisa tus datos.");
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nombre completo */}
      <div>
        <label className="block mb-1 font-bold text-[1.15rem]" style={{ color: '#386641' }}>Nombre Completo</label>
        <div className="flex items-center bg-[#efeeed] rounded-xl px-4 py-3 gap-3">
          <UserIcon className="w-6 h-6" style={{ color: '#386641', opacity: 0.6 }} />
          <input
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-base font-semibold"
            style={{ color: '#386641' }}
            placeholder="Alex Rivera"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>
      </div>
      {/* Correo electrónico */}
      <div>
        <label className="block mb-1 font-bold text-[1.15rem]" style={{ color: '#386641' }}>Correo Electrónico</label>
        <div className="flex items-center bg-[#efeeed] rounded-xl px-4 py-3 gap-3">
          <EnvelopeIcon className="w-6 h-6" style={{ color: '#386641', opacity: 0.6 }} />
          <input
            type="email"
            className="flex-1 bg-transparent border-none outline-none text-base font-semibold"
            style={{ color: '#386641' }}
            placeholder="alex.rivera@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>
      {/* Contraseña */}
      <div>
        <label className="block mb-1 font-bold text-[1.15rem]" style={{ color: '#386641' }}>Contraseña</label>
        <div className="flex items-center bg-[#efeeed] rounded-xl px-4 py-3 gap-3">
          <LockClosedIcon className="w-6 h-6" style={{ color: '#386641', opacity: 0.6 }} />
          <input
            type={showPassword ? 'text' : 'password'}
            className="flex-1 bg-transparent border-none outline-none text-base font-semibold tracking-widest"
            style={{ color: '#386641' }}
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
              <EyeSlashIcon className="w-6 h-6" style={{ color: '#386641', opacity: 0.6 }} />
            ) : (
              <EyeIcon className="w-6 h-6" style={{ color: '#386641', opacity: 0.6 }} />
            )}
          </button>
        </div>
      </div>
      {error && <div className="text-danger text-sm">{error}</div>}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 font-semibold text-snow-white py-3 rounded-md shadow-md transition bg-gradient-to-r from-[#0056D0] to-[#88A9FF] hover:from-[#003a8c] hover:to-[#88A9FF]"
      >
        {loading ? "Registrando..." : "Registrarse Ahora"} <ArrowRightIcon className="w-5 h-5" />
      </button>
    </form>
  );
}
