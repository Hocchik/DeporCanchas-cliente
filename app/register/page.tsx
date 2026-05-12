"use client";
import Navbar from '../components/Navbar';
import RegisterForm from '../components/RegisterForm';
import { CheckCircleIcon, BoltIcon, ShieldCheckIcon, TrophyIcon } from '@heroicons/react/24/solid';

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex flex-col bg-app">
      <Navbar />
      <section className="flex-1 grid lg:grid-cols-2">
        {/* Visual side (lg+) — first on desktop, hidden on mobile */}
        <aside className="hidden lg:flex relative items-center justify-center bg-section-mesh overflow-hidden order-2 lg:order-1">
          <div className="relative max-w-md p-10 space-y-8">
            <div className="space-y-4">
              <p className="text-eyebrow text-brand">Únete</p>
              <h2 className="text-display-lg leading-tight">
                Empieza a reservar tu <span className="text-brand">cancha favorita.</span>
              </h2>
              <p className="text-muted leading-relaxed">
                Crea tu cuenta gratis y accede a las mejores sedes deportivas de Lima en segundos.
              </p>
            </div>
            <ul className="space-y-3">
              <Bullet icon={<BoltIcon className="w-4 h-4" />} text="Reserva inmediata, sin llamadas" />
              <Bullet icon={<ShieldCheckIcon className="w-4 h-4" />} text="Pago seguro con tarjeta o Yape/Plin" />
              <Bullet icon={<CheckCircleIcon className="w-4 h-4" />} text="Cancela hasta 24h antes" />
              <Bullet icon={<TrophyIcon className="w-4 h-4" />} text="Historial completo de tus partidos" />
            </ul>
          </div>
        </aside>

        {/* Form side */}
        <div className="flex items-center justify-center px-4 md:px-8 py-12 md:py-16 order-1 lg:order-2">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <p className="text-eyebrow text-brand mb-3">Crear cuenta</p>
              <h1 className="text-display-lg mb-2">Empieza ahora.</h1>
              <p className="text-muted text-sm leading-relaxed">
                Es gratis. Toma menos de un minuto.
              </p>
            </div>

            <div className="card-soft p-6 md:p-7">
              <RegisterForm />
            </div>

            <p className="mt-6 text-sm text-muted text-center">
              ¿Ya tienes una cuenta?{' '}
              <a href="/login" className="font-semibold text-brand hover:underline">
                Inicia sesión
              </a>
            </p>
          </div>
        </div>
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
