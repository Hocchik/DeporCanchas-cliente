export type CourtType = "futbol" | "tenis" | "padel";

export type CourtAvailability = {
  blockedByDate?: Record<string, string[]>;
  occupiedByDate?: Record<string, string[]>;
  blockedByWeekday?: Record<string, string[]>;
  occupiedByWeekday?: Record<string, string[]>;
};

export type Court = {
  id: string;
  name: string;
  type: CourtType;
  pricePerHour: number;
  image: string;
  /** false si la cancha está en mantenimiento/inactiva o su sede inactiva */
  disponible?: boolean;
  /** etiqueta a mostrar cuando no está disponible (ej. "En mantenimiento") */
  noDisponibleLabel?: string;
  sportKey?: "futbol7" | "futbol11" | "tenis" | "padel";
  /** Valor crudo del tipo (lo guardado en `canchas_deportivas.tipo_deporte`). */
  sportValue?: string;
  /** Etiqueta a mostrar (de `tipos_cancha.etiqueta`, con tildes). */
  sportLabel?: string;
  /** Precio default de la cancha (fallback cuando ninguna regla aplica) */
  precioDefault?: number | null;
  tariffs?: {
    precio: number;
    prioridad: number;
    dias: number[] | null;
    hora_empieza: string | null;
    hora_termina: string | null;
    fecha_empieza: string | null;
    fecha_termina: string | null;
    nombre?: string | null;
  }[];
  availability?: CourtAvailability;
};

export type Campus = {
  id: string;
  name: string;
  address: string;
  courts: Court[];
};

export type ReservasData = {
  campuses: Campus[];
};

export type TimeStatus = "free" | "blocked" | "occupied";

export type CourtTimeSlot = {
  time: string;
  status: TimeStatus;
};
