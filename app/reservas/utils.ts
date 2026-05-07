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

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatTimeLabel = (time24: string) => {
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
};

export const formatTimeRange24 = (time24: string) => {
  const [hours, minutes] = time24.split(":").map(Number);
  const endMinutes = hours * 60 + minutes + 60;
  const endHours = Math.floor(endMinutes / 60) % 24;
  const endMins = endMinutes % 60;
  const startLabel = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
  const endLabel = `${endHours.toString().padStart(2, "0")}:${endMins
    .toString()
    .padStart(2, "0")}`;
  return `${startLabel} - ${endLabel}`;
};

export const getStatusForCourt = (court: Court, date: Date): CourtTimeSlot[] => {
  const dateKey = toDateKey(date);
  const dayKey = String(date.getDay());
  const blockedByDate = court.availability?.blockedByDate?.[dateKey] ?? [];
  const occupiedByDate = court.availability?.occupiedByDate?.[dateKey] ?? [];
  const blocked = new Set(
    blockedByDate.length
      ? blockedByDate
      : court.availability?.blockedByWeekday?.[dayKey] ?? []
  );
  const occupied = new Set(
    occupiedByDate.length
      ? occupiedByDate
      : court.availability?.occupiedByWeekday?.[dayKey] ?? []
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
