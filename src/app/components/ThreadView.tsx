import { useState } from "react";
import { DailyCard, User } from "../App";
import { ThreadSentence } from "./ThreadSentence";
import { ConnectionNode } from "./ConnectionNode";
import { ThreadConnector } from "./ThreadConnector";
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
          {cards.map((card, index) => {
            const sparkConnection = connections.find((c) => c.index1 === index);
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

                {index < cards.length - 1 &&
                  (sparkConnection ? (
                    <ConnectionNode
                      connection={sparkConnection}
                      isSelected={selectedConnection?.id === sparkConnection.id}
                      onToggle={() =>
                        setSelectedConnection(
                          selectedConnection?.id === sparkConnection.id
                            ? null
                            : sparkConnection
                        )
                      }
                    />
                  ) : (
                    <ThreadConnector />
                  ))}
              </div>
            );
          })}
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
