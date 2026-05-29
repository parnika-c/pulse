import { DailyCard } from "../App";

export interface ThreadConnection {
  id: string;
  card1: DailyCard;
  card2: DailyCard;
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

/** All pairs sharing the same mood (not only adjacent). */
export function findConnections(cards: DailyCard[]): ThreadConnection[] {
  const connections: ThreadConnection[] = [];

  for (let i = 0; i < cards.length - 1; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      if (cards[i].mood === cards[j].mood) {
        connections.push({
          id: `${cards[i].id}-${cards[j].id}`,
          card1: cards[i],
          card2: cards[j],
          index1: i,
          index2: j,
        });
      }
    }
  }

  return connections;
}

export function isAdjacentConnection(connection: ThreadConnection): boolean {
  return connection.index2 === connection.index1 + 1;
}

export function getConnectionBulge(
  connection: ThreadConnection,
  allConnections: ThreadConnection[]
): number {
  const span = connection.index2 - connection.index1;
  const curvedFromSameStart = allConnections
    .filter((c) => c.index1 === connection.index1 && !isAdjacentConnection(c))
    .sort((a, b) => a.index2 - b.index2);
  const curveIndex = curvedFromSameStart.findIndex((c) => c.id === connection.id);
  return 14 + span * 8 + Math.max(0, curveIndex) * 12;
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
