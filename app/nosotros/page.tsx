"use client";
import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function NosotrosPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 w-full bg-white">
        {/* Hero / Sobre Nosotros */}
        <section className="bg-[#F7FAFC]">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-forest-green mb-4">Sobre Nosotros</h1>
                <p className="text-sm text-main leading-relaxed">
                  En DeporCanchas, transformamos el deporte en una experiencia premium. Somos un centro de vanguardia
                  especializado en el alquiler de canchas de fútbol, tenis y pádel. Combinamos instalaciones de alta calidad con
                  una plataforma digital que garantiza reservas inmediatas y transparentes. Aquí, el juego comienza antes de
                  entrar a la cancha.
                </p>
              </div>

              <div>
                {/* Replace this placeholder div with an <img src="URL" .../> when you have the image URL */}
                <div className="w-full h-48 md:h-56 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center text-gray-500">
                  {/* Imagen - reemplaza con &lt;img src="..." alt="Sobre Nosotros" className="w-full h-full object-cover" /&gt; */}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Misión / Visión grid */}
        <section className="max-w-6xl mx-auto px-6 py-12 ">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
            <div>
              <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center text-gray-500">
                {/* Imagen - reemplaza con &lt;img src="..." alt="Misión" className="w-full h-full object-cover" /&gt; */}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-forest-green mb-4">Misión</h2>
              <p className="text-sm text-main leading-relaxed">
                Fomentar un estilo de vida saludable brindando espacios deportivos modernos y seguros, impulsados por
                tecnología de reserva inmediata y una atención profesional de primer nivel.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-2xl font-extrabold text-forest-green mb-4">Visión</h2>
              <p className="text-sm text-main leading-relaxed">
                Ser el complejo deportivo referente de la región y el más innovador en gestión digital, convirtiéndonos en
                la primera opción de familias y deportistas que buscan comodidad y confianza.
              </p>
            </div>
            <div className="order-1 md:order-2">
              <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center text-gray-500">
                {/* Imagen - reemplaza con &lt;img src="..." alt="Visión" className="w-full h-full object-cover" /&gt; */}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
