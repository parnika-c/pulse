import { useState } from "react";
import { DailyCard, User } from "../App";
import { ThreadSentence } from "./ThreadSentence";
import { ThreadList } from "./ThreadRail";
import { Plus } from "lucide-react";
import type { ThreadConnection } from "../utils/threadConnections";

interface ThreadViewProps {
  cards: DailyCard[];
  hasPostedToday: boolean;
  onPulseClick: () => void;
  currentUser: User;
}

export function ThreadView({ cards, hasPostedToday, onPulseClick }: ThreadViewProps) {
  const [pressedCardId, setPressedCardId] = useState<string | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<ThreadConnection | null>(null);

  const pressedCard = cards.find((c) => c.id === pressedCardId);

  return (
    <div className="relative max-w-2xl mx-auto px-4 sm:px-6 py-12 min-h-screen">
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
        <ThreadList
          cards={cards}
          selectedConnectionId={selectedConnection?.id ?? null}
          onSelectConnection={setSelectedConnection}
          renderCard={(index) => {
            const card = cards[index];
            const shouldHighlight =
              !!pressedCard &&
              pressedCard.mood === card.mood &&
              pressedCard.id !== card.id;

            return (
              <ThreadSentence
                card={card}
                onPressStart={() => setPressedCardId(card.id)}
                onPressEnd={() => setPressedCardId(null)}
                isPressed={pressedCardId === card.id}
                shouldHighlight={shouldHighlight}
              />
            );
          }}
        />
      )}

      {hasPostedToday && cards.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-sm text-zinc-500">No pulses yet today</p>
        </div>
      )}
    </div>
  );
}
