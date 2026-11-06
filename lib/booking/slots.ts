/** Créneaux RDV — Europe/Paris, mar–jeu, 12h–18h, pas avant J+2. */

export const BOOKING_TZ = "Europe/Paris";
export const BOOKING_WEEKDAYS = [2, 3, 4] as const; // mar, mer, jeu (0 = dim)
export const BOOKING_MIN_LEAD_DAYS = 2;
export const BOOKING_HORIZON_DAYS = 28;
export const BOOKING_SLOT_MINUTES = 30;
export const BOOKING_START_HOUR = 12;
export const BOOKING_END_HOUR = 18; // dernier créneau démarre à 17:30

const WEEKDAY_LABELS = [
  "dimanche",
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
] as const;

const MONTH_LABELS = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
] as const;

export type BookingSlot = {
  /** Clé stable : YYYY-MM-DDTHH:mm */
  id: string;
  date: string;
  time: string;
  label: string;
};

function parisYmd(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BOOKING_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function addCalendarDays(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y!, m! - 1, d!));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

function weekdayUtc(ymd: string): number {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y!, m! - 1, d!)).getUTCDay();
}

function formatDayLabel(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const wd = weekdayUtc(ymd);
  return `${WEEKDAY_LABELS[wd]} ${d} ${MONTH_LABELS[m! - 1]} ${y}`;
}

/** Ex. « mar. 10 nov. » — pour menus déroulants compacts */
export function formatDayShort(ymd: string): string {
  const [, m, d] = ymd.split("-").map(Number);
  const wd = weekdayUtc(ymd);
  const dayShort = WEEKDAY_LABELS[wd]!.slice(0, 3);
  const monthShort = MONTH_LABELS[m! - 1]!.slice(0, 3);
  return `${dayShort}. ${d} ${monthShort}.`;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function listSlotTimes(): string[] {
  const times: string[] = [];
  for (let minutes = BOOKING_START_HOUR * 60; minutes < BOOKING_END_HOUR * 60; minutes += BOOKING_SLOT_MINUTES) {
    const h = Math.floor(minutes / 60);
    const min = minutes % 60;
    times.push(`${pad2(h)}:${pad2(min)}`);
  }
  return times;
}

export function listAvailableDays(now = new Date()): string[] {
  const today = parisYmd(now);
  const earliest = addCalendarDays(today, BOOKING_MIN_LEAD_DAYS);
  const days: string[] = [];
  for (let i = 0; i <= BOOKING_HORIZON_DAYS; i++) {
    const ymd = addCalendarDays(earliest, i);
    if ((BOOKING_WEEKDAYS as readonly number[]).includes(weekdayUtc(ymd))) {
      days.push(ymd);
    }
  }
  return days;
}

export function listAvailableSlots(now = new Date()): BookingSlot[] {
  const times = listSlotTimes();
  return listAvailableDays(now).flatMap((date) =>
    times.map((time) => ({
      id: `${date}T${time}`,
      date,
      time,
      label: `${formatDayLabel(date)} · ${time}`,
    })),
  );
}

export function isValidSlotId(slotId: string, now = new Date()): boolean {
  return listAvailableSlots(now).some((slot) => slot.id === slotId);
}

export function formatSlotLabel(slotId: string): string | null {
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})$/.exec(slotId);
  if (!match) return null;
  const [, date, time] = match;
  return `${formatDayLabel(date!)} · ${time}`;
}

export function groupSlotsByDate(slots: BookingSlot[]): { date: string; dayLabel: string; times: BookingSlot[] }[] {
  const map = new Map<string, BookingSlot[]>();
  for (const slot of slots) {
    const list = map.get(slot.date) ?? [];
    list.push(slot);
    map.set(slot.date, list);
  }
  return [...map.entries()].map(([date, times]) => ({
    date,
    dayLabel: formatDayLabel(date),
    times,
  }));
}
