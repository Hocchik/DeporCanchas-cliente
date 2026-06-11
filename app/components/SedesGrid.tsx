"use client";

import React, { useEffect, useState } from "react";
import { ArrowRightIcon, MapPinIcon } from "@heroicons/react/24/solid";
import { createPublicClient } from "../../lib/supabase/public";

type CampusRow = {
  id: number;
  nombre: string;
  ubicacion: string;
  estado: string;
};

type CourtRow = {
  id: number;
  campus_id: number;
  nombre: string;
  tipo_deporte: string;
  estado: string;
};

type SedeCard = {
  id: number;
  nombre: string;
  descripcion: string;
  deportes: string[];
  totalCanchas: number;
  imagen: string;
};

function getCampusImage(nombre: string) {
  const norm = nombre.toLowerCase();
  if (norm.includes("miraflores")) return "/Clubterrazas_Miraflores.jpg";
  if (norm.includes("surco")) return "/futbol-plaza-santiago-surcopeg.jpeg";
  if (norm.includes("olivos")) return "/Canchas_de_futbol_los_olivos.png";
  return "/Clubterrazas_Miraflores.jpg";
}

const SPORT_STYLE: Record<string, string> = {
  "Fútbol": "bg-brand text-on-brand",
  "Tenis": "bg-accent text-brand",
  "Pádel": "bg-surface-alt text-brand border border-default",
};

export default function SedesGrid() {
  const [sedes, setSedes] = useState<SedeCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const supabase = createPublicClient();
        const [campusRes, courtsRes] = await Promise.all([
          supabase.from("campus").select("id, nombre, ubicacion, estado"),
          supabase.from("canchas_deportivas").select("id, campus_id, nombre, tipo_deporte, estado"),
        ]);
        if (campusRes.error || courtsRes.error) throw campusRes.error || courtsRes.error;
        const campusRows = (campusRes.data ?? []) as CampusRow[];
        const courtRows = (courtsRes.data ?? []) as CourtRow[];
        const data: SedeCard[] = campusRows.map((campus) => {
          const courts = courtRows.filter((c) => c.campus_id === campus.id);
          const deportesSet = new Set<string>();
          courts.forEach((c) => {
            const t = (c.tipo_deporte ?? "").toLowerCase();
            if (t.includes("tenis")) deportesSet.add("Tenis");
            else if (t.includes("padel")) deportesSet.add("Pádel");
            else deportesSet.add("Fútbol");
          });
          return {
            id: campus.id,
            nombre: campus.nombre,
            descripcion: campus.ubicacion || "",
            deportes: Array.from(deportesSet),
            totalCanchas: courts.length,
            imagen: getCampusImage(campus.nombre),
          };
        });
        setSedes(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error cargando sedes");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section id="sedes" className="py-20 md:py-24">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <div>
            <p className="text-eyebrow text-brand mb-3">Nuestras sedes</p>
            <h2 className="text-display-xl">Encuentra la cancha cerca de ti</h2>
          </div>
          <a href="/reservas" className="btn-ghost">
            Ver todas las canchas
            <ArrowRightIcon className="w-4 h-4" />
          </a>
        </div>

        {loading && (
          <div className="grid md:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="card-soft p-6 animate-pulse-soft">
                <div className="h-40 rounded-xl bg-stone-gray mb-4" />
                <div className="h-4 rounded bg-stone-gray w-2/3 mb-2" />
                <div className="h-3 rounded bg-stone-gray w-1/2" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && <p className="text-red-600">{error}</p>}

        {!loading && !error && (
          <div className="grid md:grid-cols-3 gap-6">
            {sedes.map((sede, i) => (
              <article
                key={sede.nombre}
                className="card-soft overflow-hidden group animate-fade-in-up"
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <div className="relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sede.imagen}
                    alt={sede.nombre}
                    className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="chip chip-strong backdrop-blur">
                      {sede.totalCanchas} canchas
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-display font-semibold text-lg text-primary mb-1">
                    {sede.nombre}
                  </h3>
                  <p className="text-sm text-muted flex items-center gap-1.5 mb-4">
                    <MapPinIcon className="w-4 h-4 text-brand opacity-70" />
                    {sede.descripcion}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {sede.deportes.map((d) => (
                      <span
                        key={d}
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold ${SPORT_STYLE[d] ?? "bg-stone-gray text-main"}`}
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                  <a
                    href={`/reservas?campus=${sede.id}`}
                    className="btn-secondary w-full justify-center group-hover:bg-grass-green group-hover:text-forest-green group-hover:border-strong"
                  >
                    Reservar aquí
                    <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
