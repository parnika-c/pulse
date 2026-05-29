import { DailyCard } from "../App";

export interface CapsuleDay {
  dateKey: string;
  date: Date;
  cards: DailyCard[];
  /** Mood used for the calendar cell gradient (user's pulse, or first card). */
  mood: string;
}

export const MOOD_GRADIENTS: Record<string, string> = {
  Exhausted: "linear-gradient(145deg, #d8b4fe 0%, #a855f7 55%, #7e22ce 100%)",
  Creative: "linear-gradient(145deg, #f9a8d4 0%, #ec4899 55%, #be185d 100%)",
  Accomplished: "linear-gradient(145deg, #6ee7b7 0%, #10b981 55%, #047857 100%)",
  Reflective: "linear-gradient(145deg, #93c5fd 0%, #3b82f6 55%, #1d4ed8 100%)",
  Energized: "linear-gradient(145deg, #fde047 0%, #eab308 55%, #a16207 100%)",
  Overwhelmed: "linear-gradient(145deg, #fdba74 0%, #f97316 55%, #c2410c 100%)",
  Peaceful: "linear-gradient(145deg, #5eead4 0%, #14b8a6 55%, #0f766e 100%)",
  Anxious: "linear-gradient(145deg, #fca5a5 0%, #ef4444 55%, #b91c1c 100%)",
};

export function getMoodGradient(mood: string): string {
  return MOOD_GRADIENTS[mood] ?? MOOD_GRADIENTS.Reflective;
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function dateKeyToDate(dateKey: string): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function primaryMoodForDay(cards: DailyCard[]): string {
  const userCard = cards.find((c) => c.userName === "You");
  return userCard?.mood ?? cards[0]?.mood ?? "Reflective";
}

function dayFromCards(cards: DailyCard[]): CapsuleDay {
  const anchor = cards.find((c) => c.userName === "You") ?? cards[0];
  const date = new Date(anchor.timestamp);
  date.setHours(12, 0, 0, 0);
  return {
    dateKey: toDateKey(date),
    date,
    cards,
    mood: primaryMoodForDay(cards),
  };
}

export function buildCapsuleDayMap(
  archivedDays: DailyCard[][],
  todayCards: DailyCard[]
): Map<string, CapsuleDay> {
  const map = new Map<string, CapsuleDay>();

  for (const dayCards of archivedDays) {
    if (dayCards.length === 0) continue;
    const day = dayFromCards(dayCards);
    map.set(day.dateKey, day);
  }

  if (todayCards.length > 0) {
    const today = dayFromCards(todayCards);
    map.set(today.dateKey, today);
  }

  return map;
}

export function getLatestDateKey(map: Map<string, CapsuleDay>): string | null {
  const keys = [...map.keys()].sort();
  return keys.length > 0 ? keys[keys.length - 1]! : null;
}

export function getMonthGrid(year: number, month: number): (Date | null)[][] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startPad = first.getDay();
  const daysInMonth = last.getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, month, d, 12, 0, 0, 0));
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}
