"use client";
import Navbar from '../components/Navbar';
import LoginForm from '../components/LoginForm';
import { CheckCircleIcon, BoltIcon, ShieldCheckIcon, SparklesIcon } from '@heroicons/react/24/solid';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col bg-app">
      <Navbar />
      <section className="flex-1 grid lg:grid-cols-2">
        {/* Form side */}
        <div className="flex items-center justify-center px-4 md:px-8 py-12 md:py-16">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <span className="chip mb-4 inline-flex">
                <SparklesIcon className="w-3.5 h-3.5" />
                Bienvenido de nuevo
              </span>
              <h1 className="text-display-lg mb-2">Inicia sesión</h1>
              <p className="text-muted text-sm leading-relaxed">
                Accede a tu cuenta para reservar tu cancha y ver tu historial.
              </p>
            </div>

            <div className="card-soft p-6 md:p-7">
              <LoginForm />
            </div>

            <p className="mt-6 text-sm text-muted text-center">
              ¿No tienes una cuenta?{' '}
              <a href="/register" className="font-semibold text-brand hover:underline">
                Regístrate
              </a>
            </p>
          </div>
        </div>

        {/* Visual side (lg+) */}
        <aside className="hidden lg:flex relative items-center justify-center bg-section-mesh overflow-hidden">
          <div className="relative max-w-md p-10 space-y-8">
            <div className="space-y-4">
              <p className="text-eyebrow text-brand">DeporCanchas</p>
              <h2 className="text-display-lg leading-tight">
                Tu cancha, lista en <span className="text-brand">segundos.</span>
              </h2>
              <p className="text-muted leading-relaxed">
                Conecta con la comunidad deportiva de Lima. Todo lo que necesitas para jugar, en un solo lugar.
              </p>
            </div>
            <ul className="space-y-3">
              <Bullet icon={<BoltIcon className="w-4 h-4" />} text="Reserva en menos de 30 segundos" />
              <Bullet icon={<ShieldCheckIcon className="w-4 h-4" />} text="Pago seguro y confirmación inmediata" />
              <Bullet icon={<CheckCircleIcon className="w-4 h-4" />} text="Disponibilidad real al instante" />
            </ul>
            <div className="card-soft p-5 flex items-center gap-3">
              <div className="rounded-full bg-accent p-2">
                <CheckCircleIcon className="w-5 h-5 text-brand" />
              </div>
              <div>
                <p className="text-sm font-semibold text-primary">+1,000 jugadores activos</p>
                <p className="text-xs text-muted">en las mejores sedes de Lima</p>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

function Bullet({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <li className="flex items-center gap-3 text-sm text-primary">
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-accent text-brand">
        {icon}
      </span>
      {text}
    </li>
  );
}
