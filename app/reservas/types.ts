export type CourtType = "futbol" | "tenis" | "padel";

export type CourtAvailability = {
  blockedByWeekday?: Record<string, string[]>;
  occupiedByWeekday?: Record<string, string[]>;
};

export type Court = {
  id: string;
  name: string;
  type: CourtType;
  pricePerHour: number;
  image: string;
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
