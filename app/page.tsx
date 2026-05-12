import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SedesGrid from './components/SedesGrid';
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  TrophyIcon,
  SparklesIcon,
  ShieldCheckIcon,
  BoltIcon,
} from '@heroicons/react/24/solid';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-app">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden bg-hero">
        <div className="max-w-6xl mx-auto px-4 md:px-6 pt-14 md:pt-20 pb-16 md:pb-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-7">
              <div className="inline-flex items-center gap-2 chip animate-fade-in-up">
                <SparklesIcon className="w-3.5 h-3.5" />
                Tu deporte, cerca de ti
              </div>

              <h1 className="text-display-2xl animate-fade-in-up delay-75">
                Encuentra y reserva
                <br />
                tu cancha en
                <br />
                <span className="text-brand">segundos.</span>
              </h1>

              <p className="text-lg text-muted max-w-md leading-relaxed animate-fade-in-up delay-150">
                Conecta con la comunidad deportiva de Lima. Reserva canchas de
                fútbol, tenis y pádel con disponibilidad real y confirmación al
                instante.
              </p>

              <div className="flex flex-wrap gap-3 animate-fade-in-up delay-225">
                <a href="#sedes" className="btn-primary">
                  Ver sedes disponibles
                  <ArrowRightIcon className="w-4 h-4" />
                </a>
                <a href="#como-funciona" className="btn-secondary">
                  Cómo funciona
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 animate-fade-in-up delay-300">
                <Stat icon={<BoltIcon className="w-4 h-4" />} label="Reserva en 30 seg" />
                <Stat icon={<ShieldCheckIcon className="w-4 h-4" />} label="Pago seguro" />
                <Stat icon={<CheckCircleIcon className="w-4 h-4" />} label="Confirmación al instante" />
              </div>
            </div>

            <div className="relative md:justify-self-end animate-fade-in-up delay-150">
              <div className="absolute -inset-4 rounded-[2rem] bg-accent/40 blur-2xl" aria-hidden />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/Canchasfutbol8.jpg"
                alt="Cancha de fútbol"
                className="relative rounded-[1.75rem] shadow-floating w-full max-w-md object-cover aspect-[4/5] animate-float"
              />
              <div className="absolute -bottom-4 left-6 right-6 rounded-2xl bg-surface-elev shadow-elevated px-5 py-4 flex items-center gap-3 border border-default">
                <div className="rounded-full bg-accent p-2">
                  <CheckCircleIcon className="w-5 h-5 text-brand" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary">Disponibilidad real</p>
                  <p className="text-xs text-muted">Confirma tu hora al instante</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEDES */}
      <section className="bg-section-mesh">
        <SedesGrid />
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" className="relative bg-section-tinted py-20 md:py-24 overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-40 pointer-events-none" aria-hidden />
        <div className="relative max-w-5xl mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-eyebrow text-brand mb-3">Proceso simple</p>
            <h2 className="text-display-xl">Cómo funciona</h2>
            <p className="text-muted mt-4 text-base md:text-lg leading-relaxed">
              Tres pasos para tener tu cancha lista. Sin llamadas, sin esperas, sin sorpresas.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Step
              n={1}
              icon={<MagnifyingGlassIcon className="w-7 h-7 text-brand" />}
              title="Busca tu cancha"
              text="Filtra por sede, deporte y horario que mejor te acomode."
            />
            <Step
              n={2}
              icon={<CalendarDaysIcon className="w-7 h-7 text-brand" />}
              title="Reserva tu turno"
              text="Selecciona la hora disponible y confirma tu reserva al instante."
            />
            <Step
              n={3}
              icon={<TrophyIcon className="w-7 h-7 text-brand" />}
              title="¡A jugar!"
              text="Llega a la sede, presenta tu confirmación y disfruta del partido."
            />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Stat({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted">
      <span className="text-brand">{icon}</span>
      <span className="font-medium">{label}</span>
    </div>
  );
}

function Step({ n, icon, title, text }: { n: number; icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="card-soft p-7 text-center group">
      <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent mb-5 transition-transform group-hover:scale-105">
        {icon}
        <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-brand text-on-brand text-xs font-bold flex items-center justify-center shadow-soft">
          {n}
        </span>
      </div>
      <h3 className="font-display font-semibold text-lg text-primary mb-2">{title}</h3>
      <p className="text-sm text-muted leading-relaxed">{text}</p>
    </div>
  );
}
