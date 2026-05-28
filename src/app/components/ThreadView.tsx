import { useState } from "react";
import { DailyCard, User } from "../App";
import { ThreadSentence } from "./ThreadSentence";
import { ConnectionNode } from "./ConnectionNode";
import { Plus } from "lucide-react";

interface ThreadViewProps {
  cards: DailyCard[];
  hasPostedToday: boolean;
  onPulseClick: () => void;
  currentUser: User;
}

interface Connection {
  id: string;
  card1: DailyCard;
  card2: DailyCard;
  index1: number;
  index2: number;
}

export function ThreadView({ cards, hasPostedToday, onPulseClick, currentUser }: ThreadViewProps) {
  const [pressedCardId, setPressedCardId] = useState<string | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);

  const connections = findConnections(cards);
  const pressedCard = cards.find((c) => c.id === pressedCardId);

  return (
    <div className="relative max-w-2xl mx-auto px-6 py-12 min-h-screen">
      {!hasPostedToday ? (
        <>
          <button
            onClick={onPulseClick}
            className="w-full mb-8 py-8 rounded-2xl border-2 border-dashed border-zinc-800 hover:border-zinc-700 transition-all flex flex-col items-center justify-center gap-3 group"
          >
            <div className="w-12 h-12 rounded-full bg-zinc-900 group-hover:bg-zinc-800 flex items-center justify-center transition-colors">
              <Plus className="w-6 h-6 text-zinc-600 group-hover:text-zinc-400" />
            </div>
            <p className="text-sm text-zinc-600 group-hover:text-zinc-400 transition-colors">
              Drop today's brain dump
            </p>
          </button>

          <div className="relative">
            <div className="blur-md select-none pointer-events-none space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="py-8">
                  <div className="h-20 bg-zinc-900/50 rounded-2xl" />
                </div>
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-zinc-900/90 backdrop-blur-sm rounded-2xl px-6 py-4 border border-zinc-800 text-center">
                <p className="text-sm text-zinc-400">
                  Post your pulse to see your friends' thread
                </p>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {hasPostedToday && cards.length > 0 && (
        <div className="relative">
          <svg
            className="absolute left-1/2 top-0 -translate-x-1/2 pointer-events-none"
            width="4"
            height="100%"
            style={{ minHeight: `${cards.length * 180}px` }}
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

            {cards.map((_, i) => {
              if (i === cards.length - 1) return null;

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
                    key={`thread-${i}`}
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
                  key={`thread-${i}`}
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
            {cards.map((card, index) => {
              const connection = connections.find(
                (c) => c.index1 === index || c.index2 === index
              );
              const shouldHighlight =
                pressedCard && pressedCard.mood === card.mood && pressedCard.id !== card.id;

              return (
                <div key={card.id} className="relative">
                  <ThreadSentence
                    card={card}
                    onPressStart={() => setPressedCardId(card.id)}
                    onPressEnd={() => setPressedCardId(null)}
                    isPressed={pressedCardId === card.id}
                    shouldHighlight={shouldHighlight}
                  />

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
      )}

      {hasPostedToday && cards.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-sm text-zinc-500">No pulses yet today</p>
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
