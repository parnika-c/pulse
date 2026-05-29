import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

const moodVariants = {
  Exhausted: {
    border: "border-purple-500/30",
    text: "text-purple-400",
  },
  Creative: {
    border: "border-pink-500/30",
    text: "text-pink-400",
  },
  Accomplished: {
    border: "border-green-500/30",
    text: "text-green-400",
  },
  Reflective: {
    border: "border-blue-500/30",
    text: "text-blue-400",
  },
  Energized: {
    border: "border-yellow-500/30",
    text: "text-yellow-400",
  },
  Overwhelmed: {
    border: "border-orange-500/30",
    text: "text-orange-400",
  },
  Peaceful: {
    border: "border-teal-500/30",
    text: "text-teal-400",
  },
  Anxious: {
    border: "border-red-500/30",
    text: "text-red-400",
  },
};

export function ConnectionNode({
  connection,
  isSelected,
  onToggle,
  panelSide = "right",
}: ConnectionNodeProps) {
  const moodColor = getMoodLineColor(connection.card1.mood);
  const variants = moodVariants[connection.card1.mood as keyof typeof moodVariants] || "Exhausted";
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    if (!isSelected || !buttonRef.current) return;

    const updatePosition = () => {
      const rect = buttonRef.current!.getBoundingClientRect();
      const gap = 12;
      const panelWidth = Math.min(300, window.innerWidth - 32);

      let left =
        panelSide === "right"
          ? rect.right + gap
          : rect.left - gap - panelWidth;

      left = Math.max(16, Math.min(left, window.innerWidth - panelWidth - 16));

      setPanelPos({
        top: rect.top + rect.height / 2,
        left,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isSelected, panelSide]);

  const panel =
    typeof document !== "undefined"
      ? createPortal(
          <AnimatePresence>
            {isSelected && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="fixed z-[200] w-[min(300px,calc(100vw-2rem))] -translate-y-1/2 pointer-events-auto"
                style={{ top: panelPos.top, left: panelPos.left }}
              >
                <div className={`rounded-2xl border ${variants.border} bg-zinc-950 p-5 shadow-2xl shadow-black/60`}>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className={`w-4 h-4 ${variants.text}`} />
                    <p className={`text-xs uppercase tracking-[0.2em] ${variants.text}`}>
                      Shared Spark
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className={`border-l-2 ${variants.border} pl-4`}>
                      <p className="text-xs text-zinc-500 mb-1">{connection.card1.userName}</p>
                      <p className="text-sm text-zinc-300 italic">
                        "{connection.card1.rawInput}"
                      </p>
                    </div>

                    <div className={`border-l-2 ${variants.border} pl-4`}>
                      <p className="text-xs text-zinc-500 mb-1">{connection.card2.userName}</p>
                      <p className="text-sm text-zinc-300 italic">
                        "{connection.card2.rawInput}"
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <p className="text-xs text-zinc-400">
                      Both feeling{" "}
                      <span className={`${variants.text}`}>{connection.card1.mood}</span> today
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )
      : null;

  return (
    <>
      <div className="relative z-10">
        <motion.button
          ref={buttonRef}
          onClick={onToggle}
          aria-label="Shared spark connection"
          aria-expanded={isSelected}
          className={`flex items-center justify-center w-9 h-9 rounded-full bg-zinc-950 border ${variants.border} backdrop-blur-md overflow-hidden`}
          style={{
            boxShadow: isSelected ? `0 0 20px ${moodColor}` : undefined,
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.96 }}
        >
          <Sparkles className={`w-3.5 h-3.5 ${variants.text} relative z-10`} />

          <motion.div
            className={`absolute inset-0 rounded-full border ${variants.border}/30`}
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
      </div>
      {panel}
    </>
  );
}
