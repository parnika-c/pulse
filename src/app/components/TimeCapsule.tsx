import { useState } from "react";
import { DailyCard } from "../App";
import { ThreadSentence } from "./ThreadSentence";
import { ConnectionNode } from "./ConnectionNode";
import { ThreadConnector } from "./ThreadConnector";
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
          <ThreadSentence card={currentCard} />
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
                  {dayCards.map((card, index) => {
                    const sparkConnection = connections.find((c) => c.index1 === index);

                    return (
                      <div key={card.id} className="relative">
                        <ThreadSentence card={card} />

                        {index < dayCards.length - 1 &&
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
              </div>
            );
          })}
        </div>
      ) : !currentCard ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-zinc-700" />
          </div>
          <p className="text-sm text-zinc-500 mb-1">No archived days yet</p>
          <p className="text-xs text-zinc-500 max-w-xs">
            Your daily pulses will be archived here at midnight, creating a timeline of your
            journey
          </p>
        </div>
      ) : null}
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

