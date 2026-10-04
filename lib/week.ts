import { formatIsoDate } from "@/lib/date";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

interface WeekRange {
  weekStart: string;
  weekEnd: string;
}

export function getCalendarWeek(referenceDate = new Date()): WeekRange {
  const monday = new Date(referenceDate);
  const day = monday.getDay();
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - day + (day === 0 ? -6 : 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { weekStart: formatIsoDate(monday), weekEnd: formatIsoDate(sunday) };
}

export function shiftCalendarWeek(weekStart: string, offset: number): WeekRange {
  const start = new Date(`${weekStart}T00:00:00`);
  start.setDate(start.getDate() + offset * 7);
  return getCalendarWeek(start);
}

export function formatWeekLabel({ weekStart, weekEnd }: WeekRange): string {
  if (!DATE_PATTERN.test(weekStart) || !DATE_PATTERN.test(weekEnd)) return "";
  const start = new Date(`${weekStart}T00:00:00`);
  const end = new Date(`${weekEnd}T00:00:00`);
  const date = (value: Date) => value.toLocaleDateString("en-PK", { day: "numeric", month: "short" });
  return `${date(start)} – ${date(end)} ${end.getFullYear()}`;
}
