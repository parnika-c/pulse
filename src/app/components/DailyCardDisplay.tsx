import { useState } from "react";
import { DailyCard, User } from "../App";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";

interface DailyCardDisplayProps {
  card: DailyCard;
  user: User;
  isOwn?: boolean;
}

const MOOD_COLORS: Record<string, string> = {
  Exhausted: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Creative: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  Accomplished: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Reflective: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Energized: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Overwhelmed: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Peaceful: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  Anxious: "bg-red-500/10 text-red-400 border-red-500/20",
};

export function DailyCardDisplay({ card, user, isOwn }: DailyCardDisplayProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const moodColorClass = MOOD_COLORS[card.mood] || "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";

  return (
    <div className="relative perspective-1000">
      <motion.div
        className="relative preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front of card */}
        <div
          className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 flex flex-col gap-4 relative overflow-hidden group hover:border-zinc-700 transition-colors backface-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* User Info */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{user.avatar}</span>
              <div>
                <p className="text-sm">{user.name}</p>
                <p className="text-xs text-zinc-600">
                  {card.timestamp.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            {/* Uncover button - only show for other people's cards */}
            {!isOwn && (
              <button
                onClick={() => setIsFlipped(!isFlipped)}
                className="p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors group/btn"
                aria-label="Read the mess"
              >
                <Eye className="w-4 h-4 text-zinc-500 group-hover/btn:text-zinc-300" />
              </button>
            )}
          </div>

          {/* Mood Tag */}
          <div className="relative z-10">
            <span className={`inline-block px-3 py-1 rounded-full text-xs border ${moodColorClass}`}>
              {card.mood}
            </span>
          </div>

          {/* Sentence */}
          <div className="relative z-10">
            <p className="text-base leading-relaxed text-zinc-200">{card.sentence}</p>
          </div>
        </div>

        {/* Back of card */}
        <div
          className="absolute inset-0 rounded-2xl bg-zinc-900 border border-zinc-800 p-6 flex flex-col gap-4 overflow-hidden backface-hidden"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-950/20 to-transparent" />

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-purple-400">The Mess</span>
            </div>
            <button
              onClick={() => setIsFlipped(false)}
              className="p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
              aria-label="Hide the mess"
            >
              <EyeOff className="w-4 h-4 text-zinc-500" />
            </button>
          </div>

          {/* Raw Input */}
          <div className="relative z-10 flex-1">
            <p className="text-sm leading-relaxed text-zinc-400 italic">
              "{card.rawInput}"
            </p>
          </div>

          {/* Footer */}
          <div className="relative z-10">
            <p className="text-xs text-zinc-600">— {user.name}'s unfiltered brain dump</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
