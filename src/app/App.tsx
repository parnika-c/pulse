import { useState, useEffect } from "react";
import { ThreadView } from "./components/ThreadView";
import { PulseModal } from "./components/PulseModal";
import { TimeCapsule } from "./components/TimeCapsule";
import { Sparkles, Archive } from "lucide-react";
import { getMoodLineColor } from "./utils/threadConnections";

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
    mood: "Reflective",
    sentence: "Melting after that 4-hour sprint meeting that went nowhere.",
    rawInput: "ugh 4 hours straight in that sprint meeting and we basically ended up where we started, my brain is completely fried, just want to go home and collapse",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: "3",
    userId: "3",
    userName: "Jordan",
    mood: "Anxious",
    sentence: "Finally finished the book layout after weeks of procrastinating!",
    rawInput: "what a day!! got the feature out the door this morning, stakeholder demo went amazing, they loved it, and i even managed to squeeze in my yoga class at 6pm which felt impossible this morning",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
  {
    id: "4",
    userId: "4",
    userName: "Sam",
    mood: "Reflective",
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

function dayInMonth(dayOfMonth: number): Date {
  const d = new Date();
  d.setDate(dayOfMonth);
  d.setHours(14, 0, 0, 0);
  return d;
}

function dateOn(year: number, month: number, day: number): Date {
  const d = new Date(year, month, day, 14, 0, 0, 0);
  return d;
}

const MOCK_ARCHIVED_DAYS: DailyCard[][] = [
  [
    {
      id: "arch-m1",
      userId: "1",
      userName: "You",
      mood: "Energized",
      sentence: "Spring air and an early run made everything feel possible.",
      rawInput: "gorgeous march morning, went for a run before work and felt so energized all day",
      timestamp: dateOn(2026, 2, 5),
    },
    {
      id: "arch-m2",
      userId: "2",
      userName: "Alex",
      mood: "Creative",
      sentence: "Redesigned the landing page in one inspired afternoon.",
      rawInput: "finally cracked the landing page layout and it came together in one sitting",
      timestamp: dateOn(2026, 2, 5),
    },
  ],
  [
    {
      id: "arch-m3",
      userId: "1",
      userName: "You",
      mood: "Reflective",
      sentence: "Mid-month check-in left me grateful for small wins.",
      rawInput: "took stock of the month so far and realized the small stuff is adding up",
      timestamp: dateOn(2026, 2, 18),
    },
  ],
  [
    {
      id: "arch-m4",
      userId: "1",
      userName: "You",
      mood: "Anxious",
      sentence: "Presentation nerves melted after it actually went fine.",
      rawInput: "big presentation today, anxious all morning but it went way better than expected",
      timestamp: dateOn(2026, 2, 24),
    },
    {
      id: "arch-m5",
      userId: "4",
      userName: "Sam",
      mood: "Peaceful",
      sentence: "Ended March with a quiet night in and no plans.",
      rawInput: "stayed in, cooked something simple, no notifications — exactly what i needed",
      timestamp: dateOn(2026, 2, 24),
    },
  ],
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
  [
    {
      id: "arch-6",
      userId: "1",
      userName: "You",
      mood: "Creative",
      sentence: "Brainstorm session sparked three new ideas worth chasing.",
      rawInput: "whiteboard session with the team and suddenly everything connected",
      timestamp: dayInMonth(8),
    },
  ],
  [
    {
      id: "arch-7",
      userId: "1",
      userName: "You",
      mood: "Peaceful",
      sentence: "Slow morning coffee and nowhere to be felt like luxury.",
      rawInput: "actually sat with my coffee without checking slack for once",
      timestamp: dayInMonth(15),
    },
  ],
  [
    {
      id: "arch-8",
      userId: "1",
      userName: "You",
      mood: "Accomplished",
      sentence: "Wrapped the side project I've been avoiding for months.",
      rawInput: "finally shipped the side project and it feels incredible",
      timestamp: dayInMonth(22),
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

function WaitingRoom({
  friends,
  postedCards,
}: {
  friends: User[];
  postedCards: DailyCard[];
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
      <p className="text-zinc-500 text-sm uppercase tracking-[0.2em] mb-3">
        Today's Room
      </p>

      <h2 className="text-2xl mb-3">
        Your friends are checking in
      </h2>

      <p className="text-zinc-500 max-w-sm mb-12">
        Share your pulse to unlock today's thread.
      </p>

      <div className="flex gap-5 mb-8">
        {friends.map((friend) => {
          const card = postedCards.find(
            (c) => c.userId === friend.id
          );

          const posted = Boolean(card);

          return (
            <div
              key={friend.id}
              className="relative flex items-center justify-center"
            >
              {posted && card && (
                <div
                  className="absolute w-14 h-14 rounded-full blur-xl animate-[pulse_4s_ease-in-out_infinite]"
                  style={{
                    backgroundColor: getMoodLineColor(card.mood) || "#ffffff",
                  }}
                />
              )}

              <div
                className={`
                  relative z-10 text-4xl transition-all duration-500
                  ${posted ? "" : "grayscale opacity-30"}
                `}
              >
                {friend.avatar}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-zinc-400">
        <span className="text-white font-medium">
          {postedCards.length}
        </span>
        {" of "}
        <span className="text-white font-medium">
          {friends.length}
        </span>
        {" friends checked in"}
      </div>

      <button
        className="mt-10 px-5 py-3 rounded-xl bg-white text-black hover:bg-zinc-200 transition-colors"
        onClick={() => {
          const event = new CustomEvent("openPulse");
          window.dispatchEvent(event);
        }}
      >
        Share Today's Pulse
      </button>
    </div>
  );
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

  useEffect(() => {
    const handler = () => setIsPulseModalOpen(true);

    window.addEventListener("openPulse", handler);

    return () => {
      window.removeEventListener("openPulse", handler);
    };
  }, []);

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
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col overflow-x-hidden">
      <header className="px-4 sm:px-6 py-3 sm:py-4 border-b border-zinc-800/50 backdrop-blur-sm sticky top-0 z-40 bg-zinc-950/80">
        <div className="flex items-center justify-between max-w-2xl mx-auto w-full">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl tracking-tight">Pulse</h1>
            <p className="text-xs sm:text-sm text-zinc-500 truncate">
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

      <main className="flex-1 overflow-y-auto overflow-x-hidden w-full">
        {view === "thread" ? (
          hasPostedToday ? (
            <ThreadView
              cards={visibleCards}
              hasPostedToday={hasPostedToday}
              onPulseClick={() => setIsPulseModalOpen(true)}
              currentUser={currentUser}
            />
          ) : (
            <WaitingRoom
              friends={MOCK_USERS.slice(1)}
              postedCards={MOCK_FRIEND_CARDS}
            />
          )
        ) : (
          <TimeCapsule
            archivedDays={archivedDays}
            todayThreadCards={
              hasPostedToday
                ? visibleCards
                : userCard
                  ? [userCard]
                  : []
            }
          />
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
