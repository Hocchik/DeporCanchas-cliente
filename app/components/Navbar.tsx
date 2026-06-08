"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserCircleIcon, ChevronDownIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { useSession } from '../contexts/SessionContext';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const { user, logout } = useSession();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  // Solo mostramos el banner cuando es explícitamente false. Si la columna no
  // existe (undefined) o es true, no molestamos.
  const needsVerification = user && user.emailVerificado === false;

  const handleResend = async () => {
    setResending(true);
    setResendMsg(null);
    try {
      const res = await fetch("/api/auth/verificar-reenviar", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setResendMsg(data.already ? "Tu correo ya estaba verificado." : "Te enviamos un correo. Revisa tu bandeja.");
      } else {
        setResendMsg("No se pudo reenviar. Intenta más tarde.");
      }
    } catch {
      setResendMsg("Error de red.");
    } finally {
      setResending(false);
    }
  };

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
      {needsVerification && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 text-sm">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-2 flex flex-wrap items-center gap-3 justify-between">
            <p className="flex items-center gap-2">
              <ExclamationTriangleIcon className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                Verifica tu correo (<span className="font-semibold">{user?.email}</span>) para poder pagar reservas.
              </span>
            </p>
            <div className="flex items-center gap-3">
              {resendMsg && <span className="text-xs">{resendMsg}</span>}
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-xs font-semibold underline text-amber-900 hover:text-amber-700 disabled:opacity-50"
              >
                {resending ? "Enviando…" : "Reenviar correo"}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
        <a
          href="/"
          className="group inline-flex items-center gap-2 font-display tracking-tight"
          aria-label="DeporCanchas — Ir al inicio"
        >
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-brand text-on-brand font-black text-base shadow-soft group-hover:scale-[1.04] transition">
            DC
          </span>
          <span className="text-2xl md:text-[26px] font-black text-brand leading-none">
            Depor<span className="text-primary">Canchas</span>
          </span>
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
                  <MenuItem href="/perfil" onClick={() => setIsMenuOpen(false)}>Mi perfil</MenuItem>
                  <MenuItem href="/mis-reservas" onClick={() => setIsMenuOpen(false)}>Mis reservas</MenuItem>
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
