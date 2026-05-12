"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import '../styles/colors.css';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import { useSession } from '../contexts/SessionContext';

const Navbar = () => {
  const { user, logout } = useSession();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const isLoggedIn = Boolean(user);
  const displayName = user?.nombre?.split(" ")[0] || user?.email?.split("@")[0] || "Cuenta";

  const handleSignOut = async () => {
    await logout();
    setIsMenuOpen(false);
    router.push("/");
  };

  return (
    <nav className="bg-snow-white border-b border-stone-gray px-6 py-3 flex items-center justify-between w-full">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <span className="font-bold text-xl text-forest-green tracking-tight">
          <a href="/" className="hover:text-forest-green pb-1 border-b-2 border-transparent hover:border-forest-green transition">DeporCanchas</a>
          </span>
      </div>
      {/* Links */}
      <div className="hidden md:flex items-center gap-6 text-main text-sm">
        <a href="/reservas" className="hover:text-forest-green pb-1 border-b-2 border-transparent hover:border-forest-green transition">Reserva tu cancha</a>
        <a href="/nosotros" className="hover:text-forest-green pb-1 border-b-2 border-transparent hover:border-forest-green transition">Nosotros</a>
      </div>
      {/* Acciones según login */}
      <div className="flex items-center gap-2">
        {!isLoggedIn ? (
          <>
            <a href="/login" className="text-forest-green font-semibold px-4 py-2 rounded hover:bg-grass-green hover:text-main transition text-sm">Iniciar Sesión</a>
            <a href="/register" className="bg-forest-green text-snow-white px-4 py-2 rounded font-semibold shadow hover:bg-main transition text-sm">Registrarse</a>
          </>
        ) : (
          <>
            <a href="/reservas" className="bg-forest-green text-snow-white px-4 py-2 rounded font-semibold shadow hover:bg-main transition text-sm">Reservar Ahora</a>
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen((open) => !open)}
                className="flex items-center gap-1 text-main font-semibold px-3 py-2 rounded hover:bg-grass-green transition text-sm"
                aria-haspopup="menu"
                aria-expanded={isMenuOpen}
              >
                <UserCircleIcon className="w-6 h-6 text-forest-green" />
                <span className="hidden md:inline">{displayName}</span>
              </button>
              {isMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white border border-stone-gray rounded-lg shadow-lg p-2 z-50"
                  role="menu"
                >
                  <a
                    href="/mis-reservas"
                    className="block w-full text-left px-3 py-2 rounded text-sm text-main hover:bg-grass-green hover:text-snow-white transform transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-forest-green cursor-pointer"
                    role="menuitem"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Mis reservas
                  </a>
                  <a
                    href="/perfil"
                    className="block w-full text-left px-3 py-2 rounded text-sm text-main hover:bg-grass-green hover:text-snow-white transform transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-forest-green cursor-pointer"
                    role="menuitem"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Mi perfil
                  </a>
                  <button
                    type="button"
                    className="block w-full text-left px-3 py-2 rounded text-sm text-red-600 hover:bg-red-100 hover:text-red-700 transform transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-300 cursor-pointer"
                    role="menuitem"
                    onClick={handleSignOut}
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
