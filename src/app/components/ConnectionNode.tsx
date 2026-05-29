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
  Exhausted: { border: "border-purple-500/30", text: "text-purple-400" },
  Creative: { border: "border-pink-500/30", text: "text-pink-400" },
  Accomplished: { border: "border-green-500/30", text: "text-green-400" },
  Reflective: { border: "border-blue-500/30", text: "text-blue-400" },
  Energized: { border: "border-yellow-500/30", text: "text-yellow-400" },
  Overwhelmed: { border: "border-orange-500/30", text: "text-orange-400" },
  Peaceful: { border: "border-teal-500/30", text: "text-teal-400" },
  Anxious: { border: "border-red-500/30", text: "text-red-400" },
};

const MOBILE_BREAKPOINT = 640;
const VIEWPORT_PAD = 16;
const PANEL_MAX_WIDTH = 300;
const PANEL_ESTIMATED_HEIGHT = 280;

type PanelLayout = "beside" | "below";

interface PanelPosition {
  top: number;
  left: number;
  width: number;
  layout: PanelLayout;
}

function computePanelPosition(
  rect: DOMRect,
  panelSide: "left" | "right"
): PanelPosition {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const isMobile = vw < MOBILE_BREAKPOINT;
  const width = Math.min(PANEL_MAX_WIDTH, vw - VIEWPORT_PAD * 2);

  if (isMobile) {
    let top = rect.bottom + 12;
    const left = Math.max(VIEWPORT_PAD, (vw - width) / 2);

    if (top + PANEL_ESTIMATED_HEIGHT > vh - VIEWPORT_PAD) {
      top = Math.max(VIEWPORT_PAD, rect.top - PANEL_ESTIMATED_HEIGHT - 12);
    }

    return { top, left, width, layout: "below" };
  }

  const gap = 12;
  let left =
    panelSide === "right" ? rect.right + gap : rect.left - gap - width;

  left = Math.max(VIEWPORT_PAD, Math.min(left, vw - width - VIEWPORT_PAD));

  let top = rect.top + rect.height / 2;
  const halfH = PANEL_ESTIMATED_HEIGHT / 2;
  top = Math.max(VIEWPORT_PAD + halfH, Math.min(top, vh - VIEWPORT_PAD - halfH));

  return { top, left, width, layout: "beside" };
}

export function ConnectionNode({
  connection,
  isSelected,
  onToggle,
  panelSide = "right",
}: ConnectionNodeProps) {
  const moodColor = getMoodLineColor(connection.card1.mood);
  const variants =
    moodVariants[connection.card1.mood as keyof typeof moodVariants] ??
    moodVariants.Exhausted;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [panelPos, setPanelPos] = useState<PanelPosition>({
    top: 0,
    left: 0,
    width: PANEL_MAX_WIDTH,
    layout: "beside",
  });

  useLayoutEffect(() => {
    if (!isSelected || !buttonRef.current) return;

    const updatePosition = () => {
      const rect = buttonRef.current!.getBoundingClientRect();
      setPanelPos(computePanelPosition(rect, panelSide));
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
                className={`fixed z-[200] pointer-events-auto max-h-[min(70vh,420px)] overflow-y-auto ${
                  panelPos.layout === "beside" ? "-translate-y-1/2" : ""
                }`}
                style={{
                  top: panelPos.top,
                  left: panelPos.left,
                  width: panelPos.width,
                }}
              >
                <div
                  className={`rounded-2xl border ${variants.border} bg-zinc-950 p-4 sm:p-5 shadow-2xl shadow-black/60`}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className={`w-4 h-4 shrink-0 ${variants.text}`} />
                    <p className={`text-xs uppercase tracking-[0.2em] ${variants.text}`}>
                      Shared Spark
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className={`border-l-2 ${variants.border} pl-4`}>
                      <p className="text-xs text-zinc-500 mb-1">{connection.card1.userName}</p>
                      <p className="text-sm text-zinc-300 italic break-words">
                        &ldquo;{connection.card1.rawInput}&rdquo;
                      </p>
                    </div>

                    <div className={`border-l-2 ${variants.border} pl-4`}>
                      <p className="text-xs text-zinc-500 mb-1">{connection.card2.userName}</p>
                      <p className="text-sm text-zinc-300 italic break-words">
                        &ldquo;{connection.card2.rawInput}&rdquo;
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <p className="text-xs text-zinc-400">
                      Both feeling{" "}
                      <span className={variants.text}>{connection.card1.mood}</span> today
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
      <div className="relative z-10 touch-manipulation">
        <motion.button
          ref={buttonRef}
          onClick={onToggle}
          aria-label="Shared spark connection"
          aria-expanded={isSelected}
          className={`flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-zinc-950 border ${variants.border} backdrop-blur-md overflow-hidden`}
          style={{
            boxShadow: isSelected ? `0 0 20px ${moodColor}` : undefined,
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.96 }}
        >
          <Sparkles className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${variants.text} relative z-10`} />

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
