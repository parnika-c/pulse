import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";

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

export function ConnectionNode({ connection, isSelected, onToggle }: ConnectionNodeProps) {
  return (
    <div className="relative flex items-center justify-center my-4">
      <motion.button
        onClick={onToggle}
        className="relative z-20 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 border-2 border-purple-400/50 flex items-center justify-center backdrop-blur-sm"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: isSelected
            ? "0 0 20px rgba(168, 85, 247, 0.6)"
            : "0 0 10px rgba(168, 85, 247, 0.3)",
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-4 h-4 text-purple-300" />
        </motion.div>

        <motion.div
          className="absolute inset-0 rounded-full bg-purple-500/20"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      </motion.button>

      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute top-12 left-0 right-0 z-10 mx-4"
          >
            <div className="bg-zinc-900/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <p className="text-xs uppercase tracking-wider text-purple-400">Shared Spark</p>
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
                <p className="text-xs text-zinc-600">
                  Both feeling <span className="text-purple-400">{connection.card1.mood}</span>{" "}
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
