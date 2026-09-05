import { AttendenceStatus } from "./api";

export function formatTimeGmt7(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function todayWorkDateGmt7(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const lookup = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return `${lookup.year}-${lookup.month}-${lookup.day}`;
}

export function formatStatus(status: AttendenceStatus | null): string {
  if (status === "ON_TIME") {
    return "On Time";
  } else if (status === "LATE") {
    return "Late";
  } else {
    return "Invalid";
  }
}
