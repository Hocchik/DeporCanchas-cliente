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
  sportKey?: "futbol7" | "futbol11" | "tenis" | "padel";
  tariffs?: {
    precio: number;
    prioridad: number;
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
