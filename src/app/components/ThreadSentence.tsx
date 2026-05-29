import { DailyCard } from "../App";
import { motion } from "motion/react";

interface ThreadSentenceProps {
  card: DailyCard;
  onPressStart?: () => void;
  onPressEnd?: () => void;
  isPressed?: boolean;
  shouldHighlight?: boolean;
}

const MOOD_AURA_COLORS: Record<string, string> = {
  Exhausted: "rgba(168, 85, 247, 0.2)",
  Creative: "rgba(236, 72, 153, 0.2)",
  Accomplished: "rgba(16, 185, 129, 0.2)",
  Reflective: "rgba(59, 130, 246, 0.2)",
  Energized: "rgba(234, 179, 8, 0.2)",
  Overwhelmed: "rgba(249, 115, 22, 0.2)",
  Peaceful: "rgba(20, 184, 166, 0.2)",
  Anxious: "rgba(239, 68, 68, 0.2)",
};

const MOOD_TEXT_COLORS: Record<string, string> = {
  Exhausted: "text-purple-300",
  Creative: "text-pink-300",
  Accomplished: "text-emerald-300",
  Reflective: "text-blue-300",
  Energized: "text-yellow-300",
  Overwhelmed: "text-orange-300",
  Peaceful: "text-teal-300",
  Anxious: "text-red-300",
};

export function ThreadSentence({
  card,
  onPressStart,
  onPressEnd,
  isPressed = false,
  shouldHighlight = false,
}: ThreadSentenceProps) {
  const auraColor = MOOD_AURA_COLORS[card.mood] || MOOD_AURA_COLORS.Reflective;
  const textColor = MOOD_TEXT_COLORS[card.mood] || MOOD_TEXT_COLORS.Reflective;

  return (
    <motion.div
      className="relative py-6 sm:py-8 cursor-pointer select-none"
      onMouseDown={onPressStart}
      onMouseUp={onPressEnd}
      onMouseLeave={onPressEnd}
      onTouchStart={onPressStart}
      onTouchEnd={onPressEnd}
      animate={{
        scale: isPressed ? 1.05 : shouldHighlight ? 1.02 : 1,
      }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <motion.div
        className="absolute inset-0 rounded-3xl"
        style={{
          background: `radial-gradient(ellipse at center, ${auraColor} 0%, transparent 70%)`,
          filter: "blur(40px)",
        }}
        animate={{
          scale: isPressed ? 1.8 : shouldHighlight ? 1.4 : 1,
          opacity: isPressed ? 0.8 : shouldHighlight ? 0.6 : 1,
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />

      <div className="relative z-10 flex flex-col gap-2 min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg shrink-0">{getAvatarForUser(card.userName)}</span>
            <span className="text-sm text-zinc-400 truncate">{card.userName}</span>
          </div>

          <p className="text-xs text-zinc-500 shrink-0">
            {card.timestamp.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>

          <span className={`text-xs uppercase tracking-wider shrink-0 ${textColor} opacity-80`}>
            {card.mood}
          </span>
        </div>

        <motion.p
          className="text-[15px] sm:text-base leading-relaxed text-white break-words"
          animate={{
            letterSpacing: isPressed ? "0.02em" : "0em",
          }}
          transition={{ duration: 0.2 }}
        >
          {card.sentence}
        </motion.p>
      </div>
    </motion.div>
  );
}

function getAvatarForUser(name: string): string {
  const avatars: Record<string, string> = {
    You: "🌟",
    Alex: "🎨",
    Jordan: "🚀",
    Sam: "🌺",
  };
  return avatars[name] || "👤";
}
