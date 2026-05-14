"use client";
import React from "react";
import { BoltIcon, HeartIcon, RocketLaunchIcon, ShieldCheckIcon, SparklesIcon, TrophyIcon } from "@heroicons/react/24/solid";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function NosotrosPage() {
  return (
    <main className="min-h-screen flex flex-col bg-app">
      <Navbar />

      {/* Hero */}
      <section className="bg-hero">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-16 md:py-24 text-center">
          <p className="text-eyebrow text-brand mb-3 animate-fade-in-up">Sobre nosotros</p>
          <h1 className="text-display-xl mx-auto max-w-3xl animate-fade-in-up delay-75">
            Transformamos el deporte en una <span className="text-brand">experiencia premium.</span>
          </h1>
          <p className="text-muted text-lg mt-5 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-150">
            En DeporCanchas combinamos instalaciones de alta calidad con una plataforma digital que garantiza reservas
            inmediatas y transparentes. El juego comienza antes de entrar a la cancha.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-section-mesh">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat n="3+" label="Sedes en Lima" />
          <Stat n="15+" label="Canchas activas" />
          <Stat n="1.000+" label="Jugadores" />
          <Stat n="30s" label="Reserva promedio" />
        </div>
      </section>

      {/* Misión + Visión */}
      <section className="bg-app py-20 md:py-24">
        <div className="max-w-5xl mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-6">
          <Card
            eyebrow="Misión"
            title="Activar a más personas a través del deporte."
            text="Fomentar un estilo de vida saludable brindando espacios deportivos modernos y seguros, impulsados por tecnología de reserva inmediata y atención profesional de primer nivel."
            icon={<RocketLaunchIcon className="w-6 h-6 text-brand" />}
          />
          <Card
            eyebrow="Visión"
            title="Ser el complejo deportivo referente de la región."
            text="Convertirnos en la primera opción de familias y deportistas que buscan comodidad y confianza, siendo los más innovadores en gestión digital deportiva."
            icon={<SparklesIcon className="w-6 h-6 text-brand" />}
          />
        </div>
      </section>

      {/* Valores */}
      <section className="bg-section-tinted py-20 md:py-24">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-eyebrow text-brand mb-3">Lo que nos mueve</p>
            <h2 className="text-display-xl">Nuestros valores</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            <Value icon={<BoltIcon className="w-5 h-5" />} title="Inmediatez" text="Reserva en segundos. Sin llamadas ni esperas." />
            <Value icon={<ShieldCheckIcon className="w-5 h-5" />} title="Confianza" text="Pagos seguros y disponibilidad real al instante." />
            <Value icon={<HeartIcon className="w-5 h-5" />} title="Comunidad" text="Conectamos a la comunidad deportiva de Lima." />
            <Value icon={<TrophyIcon className="w-5 h-5" />} title="Calidad" text="Sedes premium con instalaciones cuidadas." />
            <Value icon={<SparklesIcon className="w-5 h-5" />} title="Innovación" text="Tecnología que simplifica tu día a día." />
            <Value icon={<RocketLaunchIcon className="w-5 h-5" />} title="Crecimiento" text="Cada cancha es una oportunidad de mejora continua." />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-app py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <div className="card-soft p-8 md:p-12 text-center bg-section-mesh">
            <h3 className="text-display-lg max-w-2xl mx-auto">
              ¿Listo para tu próximo partido?
            </h3>
            <p className="text-muted mt-3 max-w-lg mx-auto">
              Reserva tu cancha favorita en menos de 30 segundos. Sin compromisos.
            </p>
            <a href="/reservas" className="btn-primary inline-flex mt-6">
              Reservar ahora →
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-display-lg text-brand">{n}</p>
      <p className="text-xs uppercase tracking-wider text-muted mt-1">{label}</p>
    </div>
  );
}

function Card({ eyebrow, title, text, icon }: { eyebrow: string; title: string; text: string; icon: React.ReactNode }) {
  return (
    <div className="card-soft p-7">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-accent mb-4">
        {icon}
      </div>
      <p className="text-eyebrow text-brand mb-2">{eyebrow}</p>
      <h3 className="font-display font-semibold text-lg text-primary mb-3">{title}</h3>
      <p className="text-sm text-muted leading-relaxed">{text}</p>
    </div>
  );
}

function Value({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="card-soft p-5">
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-brand-soft text-brand mb-3">
        {icon}
      </div>
      <h4 className="font-display font-semibold text-primary mb-1">{title}</h4>
      <p className="text-sm text-muted leading-relaxed">{text}</p>
    </div>
  );
}
