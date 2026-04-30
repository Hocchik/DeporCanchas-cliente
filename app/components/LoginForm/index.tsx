"use client";
import React from "react";
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { useLogin } from "./useLogin";
import "../../styles/colors.css";

export default function LoginForm({ onLogin }: { onLogin?: (user: any) => void }) {
  const {
    email, setEmail,
    clave, setClave,
    showPassword, setShowPassword,
    keepLogged, setKeepLogged,
    alreadyLoggedIn, currentEmail,
    fieldErrors, setFieldErrors,
    handleSubmit
  } = useLogin(onLogin);

  return (
    <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
      {alreadyLoggedIn && (
        <div className="text-sm text-[#386641] bg-[#eef7ea] border border-[#cfe2d5] rounded-md p-3">
          Ya estas conectado{currentEmail ? `: ${currentEmail}` : ""}.
        </div>
      )}
      
      {/* Correo electrónico */}
      <div>
        <label className="block mb-1 font-bold text-[1.15rem] text-[#386641]">Correo Electrónico</label>
        <div className={`flex items-center bg-[#efeeed] rounded-xl px-4 py-3 gap-3 border transition-colors ${fieldErrors.email ? 'border-red-500' : 'border-transparent focus-within:border-[#386641]'}`}>
          <EnvelopeIcon className="w-6 h-6 text-[#386641]" style={{ opacity: 0.6 }} />
          <input
            type="email"
            name="login_email"
            autoComplete="off"
            className="flex-1 bg-transparent border-none outline-none text-base font-semibold text-[#386641]"
            placeholder="alex.rivera@gmail.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: undefined }));
            }}
          />
        </div>
        {fieldErrors.email && <p className="text-red-500 text-sm mt-1 ml-2 leading-tight">{fieldErrors.email}</p>}
      </div>

      {/* Contraseña */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="font-bold text-[1.15rem] text-[#386641]">Contraseña</label>
          <a href="#" className="text-blue-600 text-sm font-semibold hover:underline">¿Olvidaste tu contraseña?</a>
        </div>
        <div className={`flex items-center bg-[#efeeed] rounded-xl px-4 py-3 gap-3 border transition-colors ${fieldErrors.clave ? 'border-red-500' : 'border-transparent focus-within:border-[#386641]'}`}>
          <LockClosedIcon className="w-6 h-6 text-[#386641]" style={{ opacity: 0.6 }} />
          <input
            type={showPassword ? 'text' : 'password'}
            name="login_password"
            autoComplete="new-password"
            className="flex-1 bg-transparent border-none outline-none text-base font-semibold tracking-widest text-[#386641]"
            placeholder="••••••••"
            value={clave}
            onChange={(e) => {
              setClave(e.target.value);
              if (fieldErrors.clave) setFieldErrors(prev => ({ ...prev, clave: undefined }));
            }}
          />
          <button
            type="button"
            tabIndex={-1}
            className="focus:outline-none"
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? (
              <EyeSlashIcon className="w-6 h-6 text-[#386641]" style={{ opacity: 0.6 }} />
            ) : (
              <EyeIcon className="w-6 h-6 text-[#386641]" style={{ opacity: 0.6 }} />
            )}
          </button>
        </div>
        {fieldErrors.clave && <p className="text-red-500 text-sm mt-1 ml-2 leading-tight">{fieldErrors.clave}</p>}
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
        <label htmlFor="keep-logged" className="text-[#386641] text-sm font-semibold select-none">Mantener sesión iniciada</label>
      </div>

      <button
        type="submit"
        className="w-full flex items-center justify-center gap-2 font-semibold text-snow-white py-3 rounded-md shadow-md transition bg-gradient-to-r from-[#0056D0] to-[#88A9FF] hover:from-[#003a8c] hover:to-[#88A9FF]"
      >
        Iniciar sesión
      </button>
    </form>
  );
}
