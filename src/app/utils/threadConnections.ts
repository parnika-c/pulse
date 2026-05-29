import { DailyCard } from "../App";

export interface ThreadConnection {
  id: string;
  mood: string;
  cards: DailyCard[];
  /** Sorted card indices in the thread */
  indices: number[];
  index1: number;
  index2: number;
}

export const MOOD_LINE_COLORS: Record<string, string> = {
  Exhausted: "rgba(168, 85, 247, 0.65)",
  Creative: "rgba(236, 72, 153, 0.65)",
  Accomplished: "rgba(16, 185, 129, 0.65)",
  Reflective: "rgba(59, 130, 246, 0.65)",
  Energized: "rgba(234, 179, 8, 0.65)",
  Overwhelmed: "rgba(249, 115, 22, 0.65)",
  Peaceful: "rgba(20, 184, 166, 0.65)",
  Anxious: "rgba(239, 68, 68, 0.65)",
};

export function getMoodLineColor(mood: string): string {
  return MOOD_LINE_COLORS[mood] ?? MOOD_LINE_COLORS.Exhausted;
}

/** One spark group per mood shared by 2+ cards. */
export function findConnections(cards: DailyCard[]): ThreadConnection[] {
  const byMood = new Map<string, number[]>();

  cards.forEach((card, index) => {
    const list = byMood.get(card.mood) ?? [];
    list.push(index);
    byMood.set(card.mood, list);
  });

  const groups: ThreadConnection[] = [];

  for (const [mood, indices] of byMood) {
    if (indices.length < 2) continue;

    const sorted = [...indices].sort((a, b) => a - b);
    groups.push({
      id: `spark-${mood}-${sorted.join("-")}`,
      mood,
      cards: sorted.map((i) => cards[i]),
      indices: sorted,
      index1: sorted[0],
      index2: sorted[sorted.length - 1],
    });
  }

  return groups;
}

export function getGroupBulge(span: number): number {
  return span <= 1 ? getAdjacentBulge() : 14 + span * 8;
}

/** Point at t=0.5 on the cubic curve used for spark paths. */
export function getPathNodePosition(
  anchorX: number,
  y1: number,
  y2: number,
  bulge: number
): { x: number; y: number } {
  const midY = (y1 + y2) / 2;
  if (bulge <= 0) {
    return { x: anchorX, y: midY };
  }
  return { x: anchorX - bulge * 0.75, y: midY };
}

export function getAdjacentBulge(): number {
  return 12;
}
