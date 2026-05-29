import { motion } from "motion/react";

interface ThreadConnectorProps {
  variant?: "default" | "spark";
  moodColor?: string;
}

export function ThreadConnector({
  variant = "default",
  moodColor,
}: ThreadConnectorProps) {
  const isSpark = variant === "spark";

  const accent = moodColor ?? "rgba(168, 85, 247, 0.7)";

  return (
    <div className="relative flex justify-center py-4 -my-4 min-h-[96px]">
      {/* Base thread */}
      <div
        className="absolute -top-4 -bottom-4 left-1/2 w-px -translate-x-1/2"
        style={{
          background: isSpark
            ? `linear-gradient(
                to bottom,
                transparent 0%,
                ${accent} 12%,
                ${accent} 88%,
                transparent 100%
              )`
            : `linear-gradient(
                to bottom,
                transparent,
                rgba(113,113,122,0.25) 50%,
                transparent
              )`,
        }}
      />

      {/* Ambient shimmer */}
      <motion.div
        className="absolute -top-4 -bottom-4 left-1/2 w-[3px] -translate-x-1/2 blur-[2px]"
        style={{
          background: isSpark
            ? `linear-gradient(
                to bottom,
                transparent,
                ${accent},
                transparent
              )`
            : `linear-gradient(
                to bottom,
                transparent,
                rgba(161,161,170,0.2),
                transparent
              )`,
        }}
        animate={{
          opacity: [0.15, 0.45, 0.15],
        }}
        transition={{
          duration: isSpark ? 3 : 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Traveling energy */}
      <motion.div
        className="absolute left-1/2 top-0 -translate-x-1/2"
        animate={{
          y: ["0%", "100%"],
          opacity: [0, 1, 1, 0],
          scale: [0.8, 1, 1, 0.8],
        }}
        transition={{
          duration: isSpark ? 2.8 : 4.5,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <div
          className="h-16 w-3 -translate-y-1/2 rounded-full blur-md"
          style={{
            background: isSpark
              ? `linear-gradient(
                  to bottom,
                  transparent,
                  ${accent},
                  transparent
                )`
              : `linear-gradient(
                  to bottom,
                  transparent,
                  rgba(161,161,170,0.35),
                  transparent
                )`,
          }}
        />
      </motion.div>
    </div>
  );
}
