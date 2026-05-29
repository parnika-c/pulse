import { useState } from "react";
import { DailyCard } from "../App";
import { ThreadSentence } from "./ThreadSentence";
import { ThreadList } from "./ThreadRail";
import { Calendar } from "lucide-react";
import type { ThreadConnection } from "../utils/threadConnections";

interface TimeCapsuleProps {
  archivedDays: DailyCard[][];
  currentCard: DailyCard | null;
}

export function TimeCapsule({ archivedDays, currentCard }: TimeCapsuleProps) {
  const [selectedConnection, setSelectedConnection] = useState<ThreadConnection | null>(null);
  const hasArchive = archivedDays.length > 0;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
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

                <ThreadList
                  cards={dayCards}
                  selectedConnectionId={selectedConnection?.id ?? null}
                  onSelectConnection={setSelectedConnection}
                  renderCard={(index) => <ThreadSentence card={dayCards[index]} />}
                />
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
