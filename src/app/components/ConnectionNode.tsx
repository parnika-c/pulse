import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";
import { ThreadConnector } from "./ThreadConnector";

interface Connection {
  id: string;
  card1: {
    userName: string;
    mood: string;
    rawInput: string;
  };
  card2: {
    userName: string;
    mood: string;
    rawInput: string;
  };
}

interface ConnectionNodeProps {
  connection: Connection;
  isSelected: boolean;
  onToggle: () => void;
}

const MOOD_LINE_COLORS: Record<string, string> = {
  Exhausted: "rgba(168, 85, 247, 0.55)",
  Creative: "rgba(236, 72, 153, 0.55)",
  Accomplished: "rgba(16, 185, 129, 0.55)",
  Reflective: "rgba(59, 130, 246, 0.55)",
  Energized: "rgba(234, 179, 8, 0.55)",
  Overwhelmed: "rgba(249, 115, 22, 0.55)",
  Peaceful: "rgba(20, 184, 166, 0.55)",
  Anxious: "rgba(239, 68, 68, 0.55)",
};

export function ConnectionNode({
  connection,
  isSelected,
  onToggle,
}: ConnectionNodeProps) {
  const moodColor = MOOD_LINE_COLORS[connection.card1.mood] ?? MOOD_LINE_COLORS.Exhausted;

  return (
    <div
      className={`relative flex items-center justify-center ${
        isSelected ? "z-50 mb-64" : "z-20"
      }`}
    >
      <ThreadConnector variant="spark" moodColor={moodColor} />

      <motion.button
        onClick={onToggle}
        className="
          absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
          z-20
          flex items-center justify-center
          w-10 h-10
          rounded-full
          bg-zinc-950/90
          border border-purple-400/40
          backdrop-blur-md
          overflow-hidden
        "
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.96 }}
        animate={{
          boxShadow: isSelected
            ? "0 0 30px rgba(168,85,247,0.35)"
            : "0 0 12px rgba(168,85,247,0.12)",
        }}
        transition={{ duration: 0.25 }}
      >
        <Sparkles className="w-4 h-4 text-purple-300" />
        {/* <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-4 h-4 text-purple-300 " />
        </motion.div> */}

        <motion.div
          className="absolute inset-0 rounded-full border border-purple-400/30"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="absolute inset-[6px] rounded-full bg-purple-400/10 blur-sm" />
      </motion.button>

      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.22 }}
            className="absolute top-full left-1/2 z-50 mt-3 w-[320px] -translate-x-1/2"
          >
            <div className="rounded-2xl border border-purple-500/30 bg-zinc-950/95 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <p className="text-xs uppercase tracking-[0.2em] text-purple-400">
                  Shared Spark
                </p>
              </div>

              <div className="space-y-4">
                <div className="border-l-2 border-purple-500/30 pl-4">
                  <p className="text-xs text-zinc-500 mb-1">
                    {connection.card1.userName}
                  </p>
                  <p className="text-sm text-zinc-300 italic">
                    "{connection.card1.rawInput}"
                  </p>
                </div>

                <div className="border-l-2 border-pink-500/30 pl-4">
                  <p className="text-xs text-zinc-500 mb-1">
                    {connection.card2.userName}
                  </p>
                  <p className="text-sm text-zinc-300 italic">
                    "{connection.card2.rawInput}"
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-zinc-800">
                <p className="text-xs text-zinc-400">
                  Both feeling{" "}
                  <span className="text-purple-400">
                    {connection.card1.mood}
                  </span>{" "}
                  today
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
