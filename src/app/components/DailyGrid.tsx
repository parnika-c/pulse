import { DailyCard, User } from "../App";
import { DailyCardDisplay } from "./DailyCardDisplay";
import { Plus } from "lucide-react";

interface DailyGridProps {
  userCard: DailyCard | null;
  friendCards: DailyCard[];
  hasPostedToday: boolean;
  onPulseClick: () => void;
  currentUser: User;
  collectiveMood: string;
}

const MOOD_GRADIENTS: Record<string, string> = {
  "low-energy": "from-amber-950/30 via-zinc-950 to-zinc-950",
  "mellow": "from-blue-950/30 via-zinc-950 to-zinc-950",
  "neutral": "from-zinc-950 via-zinc-950 to-zinc-950",
  "vibrant": "from-emerald-950/30 via-zinc-950 to-zinc-950",
  "energized": "from-yellow-950/30 via-zinc-950 to-zinc-950",
};

export function DailyGrid({
  userCard,
  friendCards,
  hasPostedToday,
  onPulseClick,
  currentUser,
  collectiveMood,
}: DailyGridProps) {
  const gradientClass = MOOD_GRADIENTS[collectiveMood] || MOOD_GRADIENTS.neutral;

  return (
    <div className={`max-w-2xl mx-auto px-6 py-8 bg-gradient-to-b ${gradientClass} transition-all duration-1000`}>
      {/* User's Card Slot */}
      <div className="mb-6">
        <p className="text-xs uppercase tracking-wider text-zinc-500 mb-3">Your Pulse</p>
        {userCard ? (
          <DailyCardDisplay card={userCard} user={currentUser} isOwn />
        ) : (
          <button
            onClick={onPulseClick}
            className="w-full min-h-[180px] rounded-2xl border-2 border-dashed border-zinc-800 hover:border-zinc-700 transition-all flex flex-col items-center justify-center gap-3 group py-8"
          >
            <div className="w-12 h-12 rounded-full bg-zinc-900 group-hover:bg-zinc-800 flex items-center justify-center transition-colors">
              <Plus className="w-6 h-6 text-zinc-600 group-hover:text-zinc-400" />
            </div>
            <p className="text-sm text-zinc-600 group-hover:text-zinc-400 transition-colors">
              Drop today's brain dump
            </p>
          </button>
        )}
      </div>

      {/* Friends' Cards */}
      {hasPostedToday ? (
        <div>
          <p className="text-xs uppercase tracking-wider text-zinc-500 mb-3">
            Friends' Pulses
          </p>
          <div className="grid grid-cols-1 gap-4">
            {friendCards.map((card) => (
              <DailyCardDisplay
                key={card.id}
                card={card}
                user={{ id: card.userId, name: card.userName, avatar: getAvatarForUser(card.userName) }}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="relative">
          <p className="text-xs uppercase tracking-wider text-zinc-500 mb-3">
            Friends' Pulses
          </p>
          <div className="grid grid-cols-1 gap-4 blur-md select-none pointer-events-none">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="min-h-[180px] rounded-2xl bg-zinc-900 border border-zinc-800"
              />
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-zinc-900/90 backdrop-blur-sm rounded-2xl px-6 py-4 border border-zinc-800 text-center">
              <p className="text-sm text-zinc-400">
                Post your pulse to see your friends' cards
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getAvatarForUser(name: string): string {
  const avatars: Record<string, string> = {
    Alex: "🎨",
    Jordan: "🚀",
    Sam: "🌺",
  };
  return avatars[name] || "👤";
}
