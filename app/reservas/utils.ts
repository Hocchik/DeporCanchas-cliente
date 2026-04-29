import type { Court, CourtTimeSlot, TimeStatus } from "./types";

export const SLOT_TIMES = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
];

export const LEGEND_COLORS: Record<TimeStatus, string> = {
  blocked: "#0A192F",
  free: "#F7F7F7",
  occupied: "#CD5C5C",
};

export const WEEKDAY_LABELS = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];

export const formatTimeLabel = (time24: string) => {
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
};

export const getStatusForCourt = (court: Court, date: Date): CourtTimeSlot[] => {
  const dayKey = String(date.getDay());
  const blocked = new Set(
    court.availability?.blockedByWeekday?.[dayKey] ?? []
  );
  const occupied = new Set(
    court.availability?.occupiedByWeekday?.[dayKey] ?? []
  );

  return SLOT_TIMES.map((time) => {
    if (blocked.has(time)) {
      return { time, status: "blocked" as const };
    }
    if (occupied.has(time)) {
      return { time, status: "occupied" as const };
    }
    return { time, status: "free" as const };
  });
};
