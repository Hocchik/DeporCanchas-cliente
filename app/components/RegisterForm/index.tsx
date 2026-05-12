"use client";
import React from "react";
import { ArrowRightIcon, UserIcon, EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, PhoneIcon, IdentificationIcon } from '@heroicons/react/24/solid';
import { useRegister } from "./useRegister";
import "../../styles/colors.css";

export default function RegisterForm({
  onRegister,
  redirectTo,
}: {
  onRegister?: (user: unknown) => void;
  redirectTo?: string | null;
} = {}) {
  const {
    nombre, setNombre,
    dni, setDni,
    celular, setCelular,
    email, setEmail,
    clave, setClave,
    showPassword, setShowPassword,
    fieldErrors, setFieldErrors,
    handleSubmit
  } = useRegister({ onRegister, redirectTo });

  return (
    <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
      {/* Nombre completo */}
      <div>
        <label className="block mb-1 font-bold text-[1.15rem]" style={{ color: '#386641' }}>Nombre Completo</label>
        <div className={`flex items-center bg-[#efeeed] rounded-xl px-4 py-3 gap-3 border transition-colors ${fieldErrors.nombre ? 'border-red-500' : 'border-transparent focus-within:border-[#386641]'}`}>
          <UserIcon className="w-6 h-6" style={{ color: '#386641', opacity: 0.6 }} />
          <input
            type="text"
            name="registro_nombre"
            autoComplete="off"
            className="flex-1 bg-transparent border-none outline-none text-base font-semibold w-full"
            style={{ color: '#386641' }}
            placeholder="Alex Rivera"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              if (fieldErrors.nombre) setFieldErrors(prev => ({ ...prev, nombre: undefined }));
            }}
          />
        </div>
        {fieldErrors.nombre && <p className="text-red-500 text-sm mt-1 ml-2">{fieldErrors.nombre}</p>}
      </div>

      {/* DNI */}
      <div>
        <label className="block mb-1 font-bold text-[1.15rem]" style={{ color: '#386641' }}>DNI</label>
        <div className={`flex items-center bg-[#efeeed] rounded-xl px-4 py-3 gap-3 border transition-colors ${fieldErrors.dni ? 'border-red-500' : 'border-transparent focus-within:border-[#386641]'}`}>
          <IdentificationIcon className="w-6 h-6" style={{ color: '#386641', opacity: 0.6 }} />
          <input
            type="text"
            inputMode="numeric"
            maxLength={8}
            name="registro_dni"
            autoComplete="off"
            className="flex-1 bg-transparent border-none outline-none text-base font-semibold w-full"
            style={{ color: '#386641' }}
            placeholder="71849203"
            value={dni}
            onChange={(e) => {
              setDni(e.target.value.replace(/\D/g, "").slice(0, 8));
              if (fieldErrors.dni) setFieldErrors(prev => ({ ...prev, dni: undefined }));
            }}
          />
        </div>
        {fieldErrors.dni && <p className="text-red-500 text-sm mt-1 ml-2">{fieldErrors.dni}</p>}
      </div>

      {/* Correo electrónico */}
      <div>
        <label className="block mb-1 font-bold text-[1.15rem]" style={{ color: '#386641' }}>Correo Electrónico</label>
        <div className={`flex items-center bg-[#efeeed] rounded-xl px-4 py-3 gap-3 border transition-colors ${fieldErrors.email ? 'border-red-500' : 'border-transparent focus-within:border-[#386641]'}`}>
          <EnvelopeIcon className="w-6 h-6" style={{ color: '#386641', opacity: 0.6 }} />
          <input
            type="email"
            name="registro_email"
            autoComplete="off"
            className="flex-1 bg-transparent border-none outline-none text-base font-semibold"
            style={{ color: '#386641' }}
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

      {/* Celular */}
      <div>
        <label className="block mb-1 font-bold text-[1.15rem]" style={{ color: '#386641' }}>Celular</label>
        <div className={`flex items-center bg-[#efeeed] rounded-xl px-4 py-3 gap-3 border transition-colors ${fieldErrors.celular ? 'border-red-500' : 'border-transparent focus-within:border-[#386641]'}`}>
          <PhoneIcon className="w-6 h-6" style={{ color: '#386641', opacity: 0.6 }} />
          <input
            type="tel"
            inputMode="numeric"
            maxLength={9}
            name="registro_celular"
            autoComplete="off"
            className="flex-1 bg-transparent border-none outline-none text-base font-semibold w-full"
            style={{ color: '#386641' }}
            placeholder="987654321"
            value={celular}
            onChange={(e) => {
              setCelular(e.target.value.replace(/\D/g, "").slice(0, 9));
              if (fieldErrors.celular) setFieldErrors(prev => ({ ...prev, celular: undefined }));
            }}
          />
        </div>
        {fieldErrors.celular && <p className="text-red-500 text-sm mt-1 ml-2 leading-tight">{fieldErrors.celular}</p>}
      </div>

      {/* Contraseña */}
      <div>
        <label className="block mb-1 font-bold text-[1.15rem]" style={{ color: '#386641' }}>Contraseña</label>
        <div className={`flex items-center bg-[#efeeed] rounded-xl px-4 py-3 gap-3 border transition-colors ${fieldErrors.clave ? 'border-red-500' : 'border-transparent focus-within:border-[#386641]'}`}>
          <LockClosedIcon className="w-6 h-6" style={{ color: '#386641', opacity: 0.6 }} />
          <input
            type={showPassword ? 'text' : 'password'}
            name="registro_password"
            autoComplete="new-password"
            className="flex-1 bg-transparent border-none outline-none text-base font-semibold tracking-widest"
            style={{ color: '#386641' }}
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
              <EyeSlashIcon className="w-6 h-6" style={{ color: '#386641', opacity: 0.6 }} />
            ) : (
              <EyeIcon className="w-6 h-6" style={{ color: '#386641', opacity: 0.6 }} />
            )}
          </button>
        </div>
        {fieldErrors.clave && <p className="text-red-500 text-sm mt-1 ml-2 leading-tight">{fieldErrors.clave}</p>}
      </div>

      <button
        type="submit"
        className="w-full flex items-center justify-center gap-2 font-semibold text-snow-white py-3 rounded-md shadow-md transition bg-gradient-to-r from-[#0056D0] to-[#88A9FF] hover:from-[#003a8c] hover:to-[#88A9FF] mt-6"
      >
        Registrarse Ahora <ArrowRightIcon className="w-5 h-5" />
      </button>
    </form>
  );
}
