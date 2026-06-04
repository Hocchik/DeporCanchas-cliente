"use client";

import { useEffect, useMemo, useState } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import type { Court, CourtType, ReservasData } from "../types";
import { SLOT_TIMES } from "../utils";
import { limaYMD, limaMinutesOfDay, dowYMD } from "@/lib/lima-time";

type CampusRow = { id: number; nombre: string; ubicacion: string; estado: string };
type CourtRow = { id: number; campus_id: number; nombre: string; tipo_deporte: string; estado: string; imagen_url: string | null; precio_default: number | null };
type AvailabilityRow = { canchasdep_id: number; dias_de_la_semana: number; hora_abre: string; hora_cierra: string };
type ReservaRow = { canchasdep_id: number; fecha_empieza: string; fecha_termina: string; estado: string | null };
type TarifaRow = {
  canchasdep_id: number;
  precio_reemplazo: number | null;
  tarifas: {
    nombre: string | null; precio: number; prioridad: number;
    dias: number[] | null;
    hora_empieza: string | null; hora_termina: string | null;
    fecha_empieza: string | null; fecha_termina: string | null;
  }[];
};
export type BaseTariffs = { futbol7: number; futbol11: number; tenis: number; padel: number };

const toMinutes = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const isReservationActive = (estado: string | null) => {
  if (!estado) return true;
  const n = estado.trim().toLowerCase();
  return !["cancelado", "anulado", "rechazado", "cancelada", "expirada"].includes(n);
};
const normalizeText = (v: string) => v.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

const courtImageForType = (type: CourtType) =>
  type === "futbol" ? "/Canchas_de_futbol_los_olivos.png"
    : type === "tenis" ? "/Canchasfutbol8.jpg"
      : "/Clubterrazas_Miraflores.jpg";

function buildAvailabilityForCourt(
  courtId: number,
  dates: Date[],
  availabilityRows: AvailabilityRow[],
  reservas: ReservaRow[]
) {
  const blockedByDate: Record<string, string[]> = {};
  const occupiedByDate: Record<string, string[]> = {};

  const availabilityByDay = availabilityRows
    .filter((row) => row.canchasdep_id === courtId)
    .reduce<Record<string, { start: number; end: number }[]>>((acc, row) => {
      const key = String(row.dias_de_la_semana);
      (acc[key] ||= []).push({ start: toMinutes(row.hora_abre), end: toMinutes(row.hora_cierra) });
      return acc;
    }, {});

  // Separamos reservas reales (ocupado) de bloqueos manuales del admin (estado 'bloqueada' → bloqueado)
  const isBlock = (estado: string | null) => (estado ?? "").trim().toLowerCase() === "bloqueada";

  const occupiedByDateRaw: Record<string, Set<string>> = {};
  const blockedByReservaRaw: Record<string, Set<string>> = {};

  reservas
    .filter((row) => row.canchasdep_id === courtId)
    .filter((row) => isReservationActive(row.estado))
    .forEach((row) => {
      // Hora de pared Lima: independiente de la zona del navegador
      const dateKey = limaYMD(row.fecha_empieza);
      const startMin = limaMinutesOfDay(row.fecha_empieza);
      const endMin = limaMinutesOfDay(row.fecha_termina);
      const target = isBlock(row.estado) ? blockedByReservaRaw : occupiedByDateRaw;
      const set = target[dateKey] ?? new Set<string>();
      SLOT_TIMES.forEach((time) => {
        const m = toMinutes(time);
        if (m >= startMin && m < endMin) set.add(time);
      });
      target[dateKey] = set;
    });

  dates.forEach((date) => {
    const dateKey = limaYMD(date);
    const dayKey = String(dowYMD(dateKey));
    const ranges = availabilityByDay[dayKey] ?? [];
    // Fuera del horario de atención
    const outOfHours = SLOT_TIMES.filter((t) => {
      if (!ranges.length) return true;
      const m = toMinutes(t);
      return !ranges.some((r) => m >= r.start && m < r.end);
    });
    // Bloqueos manuales del admin se suman a "bloqueado"
    const manualBlocks = blockedByReservaRaw[dateKey] ? Array.from(blockedByReservaRaw[dateKey].values()) : [];
    blockedByDate[dateKey] = Array.from(new Set([...outOfHours, ...manualBlocks]));

    const occ = occupiedByDateRaw[dateKey];
    occupiedByDate[dateKey] = occ ? Array.from(occ.values()) : [];
  });

  return { blockedByDate, occupiedByDate };
}

export function useReservasData(allDates: Date[]) {
  const supabase = useMemo(() => createPublicClient(), []);
  const [campuses, setCampuses] = useState<ReservasData["campuses"]>([]);
  const [baseTariffs, setBaseTariffs] = useState<BaseTariffs>({ futbol7: 0, futbol11: 0, tenis: 0, padel: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        setLoadError("");

        const today = new Date();
        const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endDate = new Date(startDate); endDate.setDate(startDate.getDate() + 21);

        // Canchas: intentar con imagen_url + precio_default; si alguna columna no existe
        // en BD aún, reintentar con un subconjunto progresivamente menor.
        let courtsR = await supabase
          .from("canchas_deportivas")
          .select("id, campus_id, nombre, tipo_deporte, estado, imagen_url, precio_default");
        if (courtsR.error) {
          courtsR = await supabase
            .from("canchas_deportivas")
            .select("id, campus_id, nombre, tipo_deporte, estado, imagen_url");
        }
        if (courtsR.error) {
          courtsR = await supabase
            .from("canchas_deportivas")
            .select("id, campus_id, nombre, tipo_deporte, estado");
        }

        // tipos_cancha: lectura pública (anon) para resolver etiqueta del tipo.
        // Si la tabla no existe / RLS lo niega, seguimos sin mapeo (cae a valor raw).
        let tiposR = await supabase
          .from("tipos_cancha")
          .select("valor, etiqueta, activo")
          .eq("activo", true);
        if (tiposR.error) {
          tiposR = await supabase.from("tipos_cancha").select("valor, etiqueta");
        }

        const [campusR, availR, tarifasR, reservasR, baseR] = await Promise.all([
          supabase.from("campus").select("id, nombre, ubicacion, estado"),
          supabase.from("cancha_disponibilidad").select("canchasdep_id, dias_de_la_semana, hora_abre, hora_cierra"),
          supabase.from("tarifas_canchasdep").select("canchasdep_id, precio_reemplazo, tarifas (nombre, precio, prioridad, dias, hora_empieza, hora_termina, fecha_empieza, fecha_termina)"),
          supabase.from("reservas_publicas")
            .select("canchasdep_id, fecha_empieza, fecha_termina, estado")
            .gte("fecha_empieza", startDate.toISOString())
            .lt("fecha_empieza", endDate.toISOString()),
          supabase.from("tarifas").select("nombre, precio"),
        ]);

        const err = campusR.error || courtsR.error || availR.error || tarifasR.error || reservasR.error || baseR.error;
        if (err) throw err;

        const campusRows = (campusR.data ?? []) as CampusRow[];
        const courtRows = (courtsR.data ?? []) as CourtRow[];
        const tiposMap = new Map<string, string>(
          (tiposR.data ?? []).map((t: { valor: string; etiqueta: string }) => [t.valor, t.etiqueta])
        );
        const availabilityRows = (availR.data ?? []) as AvailabilityRow[];
        const tarifaRows = (tarifasR.data ?? []) as TarifaRow[];
        const reservaRows = (reservasR.data ?? []) as ReservaRow[];
        const baseRows = (baseR.data ?? []) as { nombre: string; precio: number }[];

        const baseByName = baseRows.reduce<BaseTariffs>((acc, t) => {
          const n = normalizeText(t.nombre);
          if (n.includes("futbol 11") || n.includes("futbol11")) acc.futbol11 = t.precio;
          else if (n.includes("futbol 7") || n.includes("futbol7") || n.includes("futsal")) acc.futbol7 = t.precio;
          else if (n.includes("padel")) acc.padel = t.precio;
          else if (n.includes("tenis")) acc.tenis = t.precio;
          return acc;
        }, { futbol7: 0, futbol11: 0, tenis: 0, padel: 0 });

        const mapped = campusRows.map((c) => {
          const campusInactivo = normalizeText(c.estado ?? "") === "inactivo";
          const courts = courtRows.filter((co) => co.campus_id === c.id).map((co) => {
            const nt = normalizeText(co.tipo_deporte);
            let sportKey: Court["sportKey"] = "futbol7";
            let type: CourtType = "futbol";
            if (nt.includes("tenis")) { type = "tenis"; sportKey = "tenis"; }
            else if (nt.includes("padel")) { type = "padel"; sportKey = "padel"; }
            else if (nt.includes("futbol 11") || nt.includes("futbol11") || nt.includes("futbol once")) { type = "futbol"; sportKey = "futbol11"; }
            else if (nt.includes("futbol") || nt.includes("futsal")) { type = "futbol"; sportKey = "futbol7"; }

            const availability = buildAvailabilityForCourt(co.id, allDates, availabilityRows, reservaRows);

            const tariffCandidates = tarifaRows
              .filter((t) => t.canchasdep_id === co.id)
              .flatMap((row) => {
                const items = Array.isArray(row.tarifas) ? row.tarifas : row.tarifas ? [row.tarifas] : [];
                return items.map((it) => ({ ...it, precio: row.precio_reemplazo ?? it.precio }));
              });

            // Disponibilidad por estado de cancha/sede
            const estadoCancha = normalizeText(co.estado ?? "");
            const enMantenimiento = estadoCancha === "mantenimiento";
            const inactiva = estadoCancha === "inactivo" || campusInactivo;
            const disponible = !enMantenimiento && !inactiva;
            const noDisponibleLabel = enMantenimiento
              ? "En mantenimiento"
              : inactiva
                ? "No disponible"
                : undefined;

            return {
              id: String(co.id), name: co.nombre, type, sportKey,
              sportValue: co.tipo_deporte,
              sportLabel: tiposMap.get(co.tipo_deporte) || co.tipo_deporte,
              tariffs: tariffCandidates, pricePerHour: 0,
              precioDefault: (co as { precio_default: number | null }).precio_default ?? null,
              image: co.imagen_url || courtImageForType(type), availability,
              disponible, noDisponibleLabel,
            } satisfies Court;
          });
          return { id: String(c.id), name: c.nombre, address: c.ubicacion, courts };
        });

        if (mounted) {
          setBaseTariffs(baseByName);
          setCampuses(mapped);
        }
      } catch (e) {
        if (mounted) {
          // Errores de Supabase no son Error: tienen .message/.code; evitar "[object Object]"
          const anyE = e as { message?: string; details?: string; code?: string } | undefined;
          const msg =
            e instanceof Error ? e.message :
            anyE?.message ? `${anyE.message}${anyE.code ? ` (${anyE.code})` : ""}` :
            JSON.stringify(e);
          setLoadError(msg);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [allDates, supabase]);

  return { campuses, baseTariffs, isLoading, loadError };
}
