"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserCircleIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { useSession } from '../contexts/SessionContext';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const { user, logout } = useSession();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) setIsMenuOpen(false);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
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
    <nav className="sticky top-0 z-40 backdrop-blur-md bg-app-blur border-b border-soft">
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
        <a href="/" className="font-display font-extrabold text-xl text-brand tracking-tight">
          DeporCanchas
        </a>

        <div className="hidden md:flex items-center gap-1">
          <NavLink href="/reservas">Reserva tu cancha</NavLink>
          <NavLink href="/nosotros">Nosotros</NavLink>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {!isLoggedIn ? (
            <>
              <a href="/login" className="hidden sm:inline-flex btn-ghost">Iniciar sesión</a>
              <a href="/register" className="btn-primary !py-2 !px-4 text-sm">Registrarse</a>
            </>
          ) : (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen((open) => !open)}
                className="flex items-center gap-2 text-primary font-semibold px-2 py-1.5 rounded-full hover:bg-brand-soft transition text-sm"
                aria-haspopup="menu"
                aria-expanded={isMenuOpen}
              >
                <UserCircleIcon className="w-7 h-7 text-brand" />
                <span className="hidden md:inline">{displayName}</span>
                <ChevronDownIcon className="hidden md:inline w-3.5 h-3.5 text-muted" />
              </button>
              {isMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-surface-elev border border-default shadow-elevated overflow-hidden p-1.5 z-50"
                  role="menu"
                >
                  <MenuItem href="/reservas" onClick={() => setIsMenuOpen(false)}>Reservar ahora</MenuItem>
                  <MenuItem href="/mis-reservas" onClick={() => setIsMenuOpen(false)}>Mis reservas</MenuItem>
                  <MenuItem href="/perfil" onClick={() => setIsMenuOpen(false)}>Mi perfil</MenuItem>
                  <div className="my-1 border-t border-soft" />
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/10 transition"
                    role="menuitem"
                    onClick={handleSignOut}
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="px-3 py-2 text-sm font-medium text-muted hover:text-brand rounded-lg hover:bg-brand-soft transition"
    >
      {children}
    </a>
  );
}

function MenuItem({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <a
      href={href}
      role="menuitem"
      onClick={onClick}
      className="block px-3 py-2 rounded-lg text-sm text-primary hover:bg-brand-soft transition"
    >
      {children}
    </a>
  );
}

export default Navbar;
