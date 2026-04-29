

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SedesGrid from './components/SedesGrid';
import './styles/colors.css';
import { ArrowRightIcon, CalendarDaysIcon, CheckCircleIcon, MagnifyingGlassIcon, TrophyIcon } from '@heroicons/react/24/solid';

export default function Home() {
  return (
    <main className="bg-stone-gray min-h-screen flex flex-col font-sans">
      <Navbar />
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto mt-16 px-4 md:px-0">
        <div className="md:w-1/2 mb-8 md:mb-0">
          <p className="uppercase text-xs tracking-widest text-forest-green font-semibold mb-2">Tu deporte, cerca de ti</p>
          <h1 className="text-5xl md:text-6xl font-extrabold text-main mb-4 leading-tight">
            Encuentra y reserva<br />
            tu cancha en<br />
            segundos
          </h1>
          <p className="text-lg text-main mb-8 max-w-md">
            Conecta con la comunidad deportiva de tu barrio. Reserva canchas de fútbol, tenis y pádel sin complicaciones en las mejores sedes de Lima.
          </p>
          <div className="flex gap-4">
            <a href="#sedes" className="bg-forest-green text-snow-white px-6 py-3 rounded font-semibold shadow hover:bg-main transition flex items-center gap-2">
              Ver Sedes Disponibles
              <ArrowRightIcon className="w-5 h-5 text-snow-white" />
            </a>
            <a href="#como-funciona" className="bg-snow-white border border-forest-green text-forest-green px-6 py-3 rounded font-semibold hover:bg-grass-green hover:text-main transition">Cómo funciona</a>
          </div>
        </div>
        <div className="md:w-1/2 flex justify-center relative">
          <img src="/Canchasfutbol8.jpg" alt="Cancha de fútbol 8" className="rounded-2xl shadow-xl w-full max-w-md object-cover rotate-2" />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-snow-white rounded-lg shadow-lg px-5 py-3 flex items-center gap-2 border border-stone-gray">
            <CheckCircleIcon className="w-6 h-6 text-forest-green" />
            <div>
              <span className="block text-xs font-bold text-main">Disponibilidad Real</span>
              <span className="block text-xs text-main">Confirma tu hora al instante</span>
            </div>
          </div>
        </div>
      </section>

      {/* Sedes Section */}
      <SedesGrid />

      {/* Cómo Funciona Section */}
      <section id="como-funciona" className="py-16 bg-stone-gray">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-main mb-10 text-center">Cómo Funciona</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-grass-green rounded-full p-5 mb-4 flex items-center justify-center">
                <MagnifyingGlassIcon className="w-10 h-10 text-forest-green" />
              </div>
              <h3 className="font-semibold text-main mb-2">Busca tu Cancha</h3>
              <p className="text-sm text-main">Filtra por sede, deporte y horario que mejor te acomode.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-grass-green rounded-full p-5 mb-4 flex items-center justify-center">
                <CalendarDaysIcon className="w-10 h-10 text-forest-green" />
              </div>
              <h3 className="font-semibold text-main mb-2">Reserva tu Turno</h3>
              <p className="text-sm text-main">Selecciona la hora disponible y confirma tu reserva al instante.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-grass-green rounded-full p-5 mb-4 flex items-center justify-center">
                <TrophyIcon className="w-10 h-10 text-forest-green" />
              </div>
              <h3 className="font-semibold text-main mb-2">¡A Jugar!</h3>
              <p className="text-sm text-main">Llega a la sede, presenta tu confirmación y disfruta del partido.</p>
            </div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <Footer />
    </main>
  );
}
