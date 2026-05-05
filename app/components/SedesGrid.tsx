import React, { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";

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

function getCampusImage(nombre: string) {
  const norm = nombre.toLowerCase();
  if (norm.includes("miraflores")) return "/Clubterrazas_Miraflores.jpg";
  if (norm.includes("surco")) return "/futbol-plaza-santiago-surcopeg.jpeg";
  if (norm.includes("olivos")) return "/Canchas_de_futbol_los_olivos.png";
  return "/Clubterrazas_Miraflores.jpg";
}

export default function SedesGrid() {
  const [sedes, setSedes] = useState<{
    nombre: string;
    descripcion: string;
    deportes: string[];
    libres: number;
    imagen: string;
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const supabase = createClient();
        const [campusRes, courtsRes] = await Promise.all([
          supabase.from("campus").select("id, nombre, ubicacion, estado"),
          supabase.from("canchas_deportivas").select("id, campus_id, nombre, tipo_deporte, estado"),
        ]);
        if (campusRes.error || courtsRes.error) throw campusRes.error || courtsRes.error;
        const campusRows = (campusRes.data ?? []) as CampusRow[];
        const courtRows = (courtsRes.data ?? []) as CourtRow[];
        const sedesData = campusRows.map((campus) => {
          const courts = courtRows.filter((c) => c.campus_id === campus.id);
          const deportesSet = new Set<string>();
          courts.forEach((c) => {
            if (c.tipo_deporte) {
              if (c.tipo_deporte.toLowerCase().includes("tenis")) deportesSet.add("Tenis");
              else if (c.tipo_deporte.toLowerCase().includes("padel")) deportesSet.add("Padel");
              else deportesSet.add("Fútbol");
            }
          });
          const libres = courts.filter((c) => c.estado?.toLowerCase() === "libre" || c.estado?.toLowerCase() === "disponible").length;
          return {
            nombre: campus.nombre,
            descripcion: campus.ubicacion || "",
            deportes: Array.from(deportesSet),
            libres,
            imagen: getCampusImage(campus.nombre),
          };
        });
        setSedes(sedesData);
      } catch (e: any) {
        setError(e.message || "Error cargando sedes");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

export default function SedesGrid() {
  return (
    <section id="sedes" className="bg-snow-white py-16 mt-16">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-forest-green mb-2">Nuestras Sedes</h2>
        <div className="h-1 w-16 bg-forest-green rounded mb-8"></div>
        <div className="grid md:grid-cols-3 gap-8">
          {sedes.map((sede) => (
            <div key={sede.nombre} className="bg-snow-white border border-stone-gray rounded-xl shadow-sm p-6 flex flex-col hover:shadow-lg transition">
              <img src={sede.imagen} alt={sede.nombre} className="rounded-lg mb-4 h-40 object-cover" />
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-grass-green text-main text-xs px-2 py-1 rounded font-semibold">{sede.libres} CANCHAS LIBRES</span>
              </div>
              <h3 className="font-bold text-lg text-main mb-1">{sede.nombre}</h3>
              <p className="text-sm text-main mb-2">{sede.descripcion}</p>
              <div className="flex gap-2 mb-4">
                {sede.deportes.map((dep) => {
                  let colorClass = '';
                  if (dep === 'Fútbol') colorClass = 'bg-forest-green text-snow-white';
                  else if (dep === 'Tenis') colorClass = 'bg-grass-green text-main';
                  else if (dep === 'Padel') colorClass = 'bg-accent text-main';
                  else colorClass = 'bg-stone-gray text-main';
                  return (
                    <span
                      key={dep}
                      className={`text-xs px-2 py-1 rounded font-semibold shadow-sm ${colorClass}`}
                    >
                      {dep}
                    </span>
                  );
                })}
              </div>
              <a href="/reservas" className="mt-auto border border-forest-green text-forest-green px-4 py-2 rounded font-semibold hover:bg-grass-green hover:text-main transition">Reservar Aquí</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
