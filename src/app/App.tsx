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

const ARCHIVE_STORAGE_KEY = "pulse-archived-days";
const USER_CARD_STORAGE_KEY = "pulse-user-card";
const LAST_ACTIVE_DATE_KEY = "pulse-last-active-date";

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

const MOCK_ARCHIVED_DAYS: DailyCard[][] = [
  [
    {
      id: "arch-1",
      userId: "1",
      userName: "You",
      mood: "Reflective",
      sentence: "Quiet Sunday thinking about where the year is headed.",
      rawInput: "slow sunday, lots of thinking about goals for the rest of the year",
      timestamp: daysAgo(1),
    },
    {
      id: "arch-2",
      userId: "2",
      userName: "Alex",
      mood: "Creative",
      sentence: "Sketched out a new layout idea that finally clicked.",
      rawInput: "spent the afternoon sketching and something finally clicked with the new layout",
      timestamp: daysAgo(1),
    },
    {
      id: "arch-3",
      userId: "4",
      userName: "Sam",
      mood: "Peaceful",
      sentence: "Long walk without my phone felt like a reset.",
      rawInput: "went for a long walk without my phone and it felt like a full reset",
      timestamp: daysAgo(1),
    },
  ],
  [
    {
      id: "arch-4",
      userId: "3",
      userName: "Jordan",
      mood: "Accomplished",
      sentence: "Shipped the beta and the team celebrated with coffee.",
      rawInput: "shipped the beta today!! team grabbed coffee to celebrate, feeling really good",
      timestamp: daysAgo(2),
    },
    {
      id: "arch-5",
      userId: "1",
      userName: "You",
      mood: "Exhausted",
      sentence: "Back-to-back deadlines left no room to breathe.",
      rawInput: "back to back deadlines all day, barely had time to eat lunch",
      timestamp: daysAgo(2),
    },
  ],
];

function serializeCard(card: DailyCard): string {
  return JSON.stringify({ ...card, timestamp: card.timestamp.toISOString() });
}

function deserializeCard(raw: string): DailyCard {
  const parsed = JSON.parse(raw);
  return { ...parsed, timestamp: new Date(parsed.timestamp) };
}

function serializeArchivedDays(days: DailyCard[][]): string {
  return JSON.stringify(
    days.map((day) => day.map((card) => ({ ...card, timestamp: card.timestamp.toISOString() })))
  );
}

function deserializeArchivedDays(raw: string): DailyCard[][] {
  const parsed = JSON.parse(raw) as Array<Array<{ timestamp: string } & DailyCard>>;
  return parsed.map((day) => day.map((card) => ({ ...card, timestamp: new Date(card.timestamp) })));
}

function loadArchivedDays(): DailyCard[][] {
  try {
    const stored = localStorage.getItem(ARCHIVE_STORAGE_KEY);
    if (stored) {
      const days = deserializeArchivedDays(stored);
      if (days.length > 0) {
        return days;
      }
    }
  } catch {
    // ignore corrupt storage
  }
  return MOCK_ARCHIVED_DAYS;
}

function loadUserCard(): DailyCard | null {
  try {
    const stored = localStorage.getItem(USER_CARD_STORAGE_KEY);
    if (stored) {
      return deserializeCard(stored);
    }
  } catch {
    // ignore corrupt storage
  }
  return null;
}

function getDateKey(date = new Date()): string {
  return date.toDateString();
}

export default function App() {
  const [view, setView] = useState<"thread" | "capsule">("thread");
  const [userCard, setUserCard] = useState<DailyCard | null>(() => loadUserCard());
  const [isPulseModalOpen, setIsPulseModalOpen] = useState(false);
  const [archivedDays, setArchivedDays] = useState<DailyCard[][]>(() => loadArchivedDays());

  useEffect(() => {
    const today = getDateKey();
    const lastActive = localStorage.getItem(LAST_ACTIVE_DATE_KEY);

    if (lastActive && lastActive !== today) {
      const storedCard = localStorage.getItem(USER_CARD_STORAGE_KEY);
      if (storedCard) {
        const card = deserializeCard(storedCard);
        setArchivedDays((prev) => {
          const next = [[card, ...MOCK_FRIEND_CARDS], ...prev];
          localStorage.setItem(ARCHIVE_STORAGE_KEY, serializeArchivedDays(next));
          return next;
        });
        localStorage.removeItem(USER_CARD_STORAGE_KEY);
        setUserCard(null);
      }
    }

    localStorage.setItem(LAST_ACTIVE_DATE_KEY, today);
  }, []);

  useEffect(() => {
    localStorage.setItem(ARCHIVE_STORAGE_KEY, serializeArchivedDays(archivedDays));
  }, [archivedDays]);

  useEffect(() => {
    if (userCard) {
      localStorage.setItem(USER_CARD_STORAGE_KEY, serializeCard(userCard));
    } else {
      localStorage.removeItem(USER_CARD_STORAGE_KEY);
    }
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
