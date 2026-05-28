import { useState } from "react";
import { DailyCard } from "../App";
import { ThreadSentence } from "./ThreadSentence";
import { ConnectionNode } from "./ConnectionNode";
import { Calendar } from "lucide-react";

interface TimeCapsuleProps {
  archivedDays: DailyCard[][];
  currentCard: DailyCard | null;
}

interface Connection {
  id: string;
  card1: DailyCard;
  card2: DailyCard;
  index1: number;
  index2: number;
}

export function TimeCapsule({ archivedDays, currentCard }: TimeCapsuleProps) {
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const hasArchive = archivedDays.length > 0;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      {currentCard && (
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-zinc-500" />
            <p className="text-xs uppercase tracking-wider text-zinc-500">
              Today • {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </p>
          </div>
          <div className="relative">
            <svg
              className="absolute left-1/2 top-0 -translate-x-1/2 pointer-events-none"
              width="4"
              height="100%"
              style={{ minHeight: "180px" }}
            >
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
            </svg>
            <ThreadSentence card={currentCard} />
          </div>
        </div>
      )}

      {hasArchive ? (
        <div className="space-y-12">
          {archivedDays.map((dayCards, dayIndex) => {
            const dayDate = new Date();
            dayDate.setDate(dayDate.getDate() - (dayIndex + 1));
            const connections = findConnections(dayCards);

            return (
              <div key={dayIndex}>
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-4 h-4 text-zinc-500" />
                  <p className="text-xs uppercase tracking-wider text-zinc-500">
                    {dayDate.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div className="relative">
                  <svg
                    className="absolute left-1/2 top-0 -translate-x-1/2 pointer-events-none"
                    width="4"
                    height="100%"
                    style={{ minHeight: `${dayCards.length * 180}px` }}
                  >
                    {dayCards.map((_, i) => {
                      if (i === dayCards.length - 1) return null;

                      const y1 = i * 180 + 90;
                      const y2 = (i + 1) * 180 + 90;
                      const connection = connections.find(
                        (c) => c.index1 === i && c.index2 === i + 1
                      );

                      if (connection) {
                        const midY = (y1 + y2) / 2;
                        const loopWidth = 60;
                        return (
                          <path
                            key={`thread-${dayIndex}-${i}`}
                            d={`M 2 ${y1} Q ${loopWidth} ${midY} 2 ${y2}`}
                            stroke="rgba(255, 255, 255, 0.3)"
                            strokeWidth="2"
                            fill="none"
                            filter="url(#glow)"
                          />
                        );
                      }

                      return (
                        <line
                          key={`thread-${dayIndex}-${i}`}
                          x1="2"
                          y1={y1}
                          x2="2"
                          y2={y2}
                          stroke="rgba(255, 255, 255, 0.3)"
                          strokeWidth="2"
                          filter="url(#glow)"
                        />
                      );
                    })}
                  </svg>

                  <div className="space-y-4">
                    {dayCards.map((card, index) => {
                      const connection = connections.find(
                        (c) => c.index1 === index || c.index2 === index
                      );

                      return (
                        <div key={card.id} className="relative">
                          <ThreadSentence card={card} />

                          {connection && connection.index1 === index && (
                            <ConnectionNode
                              connection={connection}
                              isSelected={selectedConnection?.id === connection.id}
                              onToggle={() =>
                                setSelectedConnection(
                                  selectedConnection?.id === connection.id ? null : connection
                                )
                              }
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-zinc-700" />
          </div>
          <p className="text-sm text-zinc-500 mb-1">No archived days yet</p>
          <p className="text-xs text-zinc-600 max-w-xs">
            Your daily pulses will be archived here at midnight, creating a timeline of your
            journey
          </p>
        </div>
      )}
    </div>
  );
}

function findConnections(cards: DailyCard[]): Connection[] {
  const connections: Connection[] = [];

  for (let i = 0; i < cards.length - 1; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      if (cards[i].mood === cards[j].mood && j === i + 1) {
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

function getMoodColor(mood: string): string {
  const colors: Record<string, string> = {
    Exhausted: "#a855f7",
    Creative: "#ec4899",
    Accomplished: "#10b981",
    Reflective: "#3b82f6",
    Energized: "#eab308",
    Overwhelmed: "#f97316",
    Peaceful: "#14b8a6",
    Anxious: "#ef4444",
  };
  return colors[mood] || "#a855f7";
}
