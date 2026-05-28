import { useState, useEffect } from "react";
import { ThreadView } from "./components/ThreadView";
import { PulseModal } from "./components/PulseModal";
import { TimeCapsule } from "./components/TimeCapsule";
import { Sparkles, Archive } from "lucide-react";

export interface DailyCard {
  id: string;
  userId: string;
  userName: string;
  mood: string;
  sentence: string;
  rawInput: string;
  timestamp: Date;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
}

const MOCK_USERS: User[] = [
  { id: "1", name: "You", avatar: "🌟" },
  { id: "2", name: "Alex", avatar: "🎨" },
  { id: "3", name: "Jordan", avatar: "🚀" },
  { id: "4", name: "Sam", avatar: "🌺" },
];

const MOCK_FRIEND_CARDS: DailyCard[] = [
  {
    id: "2",
    userId: "2",
    userName: "Alex",
    mood: "Exhausted",
    sentence: "Melting after that 4-hour sprint meeting that went nowhere.",
    rawInput: "ugh 4 hours straight in that sprint meeting and we basically ended up where we started, my brain is completely fried, just want to go home and collapse",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: "3",
    userId: "3",
    userName: "Jordan",
    mood: "Accomplished",
    sentence: "Finally finished the book layout after weeks of procrastinating!",
    rawInput: "what a day!! got the feature out the door this morning, stakeholder demo went amazing, they loved it, and i even managed to squeeze in my yoga class at 6pm which felt impossible this morning",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
  {
    id: "4",
    userId: "4",
    userName: "Sam",
    mood: "Exhausted",
    sentence: "Survived another 12-hour workday but questioning everything.",
    rawInput: "12 hours straight today and i'm just exhausted... i keep saying yes to everything and i think it's catching up to me. need to set better boundaries but don't know how to start",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
];

export default function App() {
  const [view, setView] = useState<"thread" | "capsule">("thread");
  const [userCard, setUserCard] = useState<DailyCard | null>(null);
  const [isPulseModalOpen, setIsPulseModalOpen] = useState(false);
  const [archivedDays, setArchivedDays] = useState<DailyCard[][]>([]);

  useEffect(() => {
    const checkMidnight = () => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        if (userCard) {
          setArchivedDays((prev) => [[userCard, ...MOCK_FRIEND_CARDS], ...prev]);
          setUserCard(null);
        }
      }
    };

    const interval = setInterval(checkMidnight, 60000);
    return () => clearInterval(interval);
  }, [userCard]);

  const handlePulseSubmit = (card: DailyCard) => {
    setUserCard(card);
    setIsPulseModalOpen(false);
  };

  const currentUser = MOCK_USERS[0];
  const hasPostedToday = userCard !== null;

  const visibleCards = hasPostedToday
    ? [userCard!, ...MOCK_FRIEND_CARDS].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    : userCard ? [userCard] : [];

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <header className="px-6 py-4 border-b border-zinc-800/50 backdrop-blur-sm sticky top-0 z-40 bg-zinc-950/80">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div>
            <h1 className="text-xl tracking-tight">Pulse</h1>
            <p className="text-sm text-zinc-500">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setView("thread")}
              className={`p-2 rounded-lg transition-colors ${
                view === "thread"
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
              aria-label="Thread View"
            >
              <Sparkles className="w-5 h-5" />
            </button>
            <button
              onClick={() => setView("capsule")}
              className={`p-2 rounded-lg transition-colors ${
                view === "capsule"
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
              aria-label="Time Capsule"
            >
              <Archive className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        {view === "thread" ? (
          <ThreadView
            cards={visibleCards}
            hasPostedToday={hasPostedToday}
            onPulseClick={() => setIsPulseModalOpen(true)}
            currentUser={currentUser}
          />
        ) : (
          <TimeCapsule archivedDays={archivedDays} currentCard={userCard} />
        )}
      </main>

      <PulseModal
        isOpen={isPulseModalOpen}
        onClose={() => setIsPulseModalOpen(false)}
        onSubmit={handlePulseSubmit}
        currentUser={currentUser}
      />
    </div>
  );
}
