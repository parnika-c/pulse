import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";
import { getMoodLineColor } from "../utils/threadConnections";

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
  panelSide?: "left" | "right";
}

export function ConnectionNode({
  connection,
  isSelected,
  onToggle,
  panelSide = "left",
}: ConnectionNodeProps) {
  const moodColor = getMoodLineColor(connection.card1.mood);
  const panelPosition =
    panelSide === "left"
      ? "right-full mr-3 top-1/2 -translate-y-1/2"
      : "left-full ml-3 top-1/2 -translate-y-1/2";

  return (
    <div className={`relative ${isSelected ? "z-50" : "z-10"}`}>
      <motion.button
        onClick={onToggle}
        aria-label="Shared spark connection"
        aria-expanded={isSelected}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-zinc-950 border border-purple-400/40 backdrop-blur-md overflow-hidden"
        style={{
          boxShadow: isSelected ? `0 0 20px ${moodColor}` : undefined,
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.96 }}
      >
        <Sparkles className="w-3.5 h-3.5 text-purple-300 relative z-10" />

        <motion.div
          className="absolute inset-0 rounded-full border border-purple-400/30"
          animate={{
            scale: [1, 1.12, 1],
            opacity: [0.25, 0.55, 0.25],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.button>

      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className={`absolute ${panelPosition} w-[min(300px,calc(100vw-5rem))]`}
          >
            <div className="rounded-2xl border border-purple-500/30 bg-zinc-950 p-5 shadow-2xl shadow-black/50">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <p className="text-xs uppercase tracking-[0.2em] text-purple-400">
                  Shared Spark
                </p>
              </div>

              <div className="space-y-4">
                <div className="border-l-2 border-purple-500/30 pl-4">
                  <p className="text-xs text-zinc-500 mb-1">{connection.card1.userName}</p>
                  <p className="text-sm text-zinc-300 italic">"{connection.card1.rawInput}"</p>
                </div>

                <div className="border-l-2 border-pink-500/30 pl-4">
                  <p className="text-xs text-zinc-500 mb-1">{connection.card2.userName}</p>
                  <p className="text-sm text-zinc-300 italic">"{connection.card2.rawInput}"</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-zinc-800">
                <p className="text-xs text-zinc-400">
                  Both feeling{" "}
                  <span className="text-purple-400">{connection.card1.mood}</span> today
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
