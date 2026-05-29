import { useCallback, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { DailyCard } from "../App";
import { ConnectionNode } from "./ConnectionNode";
import {
  findConnections,
  getGroupBulge,
  getMoodLineColor,
  getPathNodePosition,
  type ThreadConnection,
} from "../utils/threadConnections";

const RAIL_ANCHOR_INSET = 6;
const RAIL_MIN_WIDTH = 44;
/** Space for button (18px radius) centered on the leftmost part of a curve */
const RAIL_NODE_PADDING = 20;

interface CardAnchor {
  index: number;
  centerY: number;
}

interface ThreadListProps {
  cards: DailyCard[];
  renderCard: (index: number) => ReactNode;
  selectedConnectionId: string | null;
  onSelectConnection: (connection: ThreadConnection | null) => void;
}

function bulgeForGroup(connection: ThreadConnection): number {
  const span = connection.index2 - connection.index1;
  return getGroupBulge(span);
}

export function ThreadList({
  cards,
  renderCard,
  selectedConnectionId,
  onSelectConnection,
}: ThreadListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [anchors, setAnchors] = useState<CardAnchor[]>([]);
  const [railHeight, setRailHeight] = useState(0);

  const connections = findConnections(cards);

  const { railWidth, anchorX } = useMemo(() => {
    if (connections.length === 0) {
      return { railWidth: RAIL_MIN_WIDTH, anchorX: RAIL_MIN_WIDTH - RAIL_ANCHOR_INSET };
    }
    const maxBulge = Math.max(
      ...connections.map((c) => bulgeForGroup(c))
    );
    const width = Math.max(
      RAIL_MIN_WIDTH,
      Math.ceil(maxBulge * 0.75 + RAIL_NODE_PADDING + RAIL_ANCHOR_INSET)
    );
    return { railWidth: width, anchorX: width - RAIL_ANCHOR_INSET };
  }, [connections]);

  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const nextAnchors: CardAnchor[] = [];

    for (let i = 0; i < cards.length; i++) {
      const el = cardRefs.current[i];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      nextAnchors.push({
        index: i,
        centerY: rect.top - containerRect.top + rect.height / 2,
      });
    }

    setAnchors(nextAnchors);
    setRailHeight(containerRect.height);
  }, [cards]);

  useLayoutEffect(() => {
    measure();
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(measure);
    observer.observe(container);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure, cards, selectedConnectionId]);

  const anchorByIndex = Object.fromEntries(anchors.map((a) => [a.index, a]));

  return (
    <div ref={containerRef} className="relative flex gap-2 sm:gap-3 overflow-visible w-full min-w-0">
      {anchors.length > 1 && railHeight > 0 && connections.length > 0 && (
        <div
          className="relative shrink-0 overflow-visible"
          style={{ width: railWidth, minWidth: railWidth, height: railHeight }}
        >
          <svg
            className="absolute inset-0 overflow-visible pointer-events-none"
            width={railWidth}
            height={railHeight}
          >
            {connections.map((connection) => {
              const a1 = anchorByIndex[connection.index1];
              const a2 = anchorByIndex[connection.index2];
              if (!a1 || !a2) return null;

              const bulge = bulgeForGroup(connection);
              const accent = getMoodLineColor(connection.mood);
              const path = `M ${anchorX} ${a1.centerY} C ${anchorX - bulge} ${a1.centerY}, ${anchorX - bulge} ${a2.centerY}, ${anchorX} ${a2.centerY}`;

              return (
                <PulsingCurvePath
                  key={`path-${connection.id}`}
                  id={connection.id}
                  path={path}
                  accent={accent}
                  y1={a1.centerY}
                  y2={a2.centerY}
                />
              );
            })}
          </svg>

          {connections.map((connection) => {
            const a1 = anchorByIndex[connection.index1];
            const a2 = anchorByIndex[connection.index2];
            if (!a1 || !a2) return null;

            const bulge = bulgeForGroup(connection);
            const { x, y } = getPathNodePosition(
              anchorX,
              a1.centerY,
              a2.centerY,
              bulge
            );

            return (
              <div
                key={`node-${connection.id}`}
                className="absolute z-10 pointer-events-auto"
                style={{
                  left: x,
                  top: y,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <ConnectionNode
                  connection={connection}
                  isSelected={selectedConnectionId === connection.id}
                  onToggle={() =>
                    onSelectConnection(
                      selectedConnectionId === connection.id ? null : connection
                    )
                  }
                  panelSide="right"
                />
              </div>
            );
          })}
        </div>
      )}

      <div className="flex-1 min-w-0">
        {cards.map((card, index) => (
          <div
            key={card.id}
            ref={(el) => {
              cardRefs.current[index] = el;
            }}
          >
            {renderCard(index)}
          </div>
        ))}
      </div>
    </div>
  );
}

function PulsingCurvePath({
  id,
  path,
  accent,
  y1,
  y2,
}: {
  id: string;
  path: string;
  accent: string;
  y1: number;
  y2: number;
}) {
  const isDescending = y2 < y1;
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);
  const height = maxY - minY;

  return (
    <g>
      <defs>
        <linearGradient id={`taper-${id}`} x1="0" y1={y1} x2="0" y2={y2} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="black" stopOpacity="0" />
          <stop offset="20%" stopColor="white" stopOpacity="1" />
          <stop offset="80%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="black" stopOpacity="0" />
        </linearGradient>
        <mask id={`mask-${id}`}>
          <rect x="-200" y={minY - 100} width="400" height={height + 200} fill={`url(#taper-${id})`} />
        </mask>

        <linearGradient id={`spark-grad-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={accent} stopOpacity="0" />
          <stop offset="50%" stopColor={accent} stopOpacity="1" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>

      <path d={path} fill="none" stroke={accent} strokeWidth={1} strokeOpacity={0.1} mask={`url(#mask-${id})`} />

      <motion.path
        d={path}
        fill="none"
        stroke={`url(#spark-grad-${id})`}
        strokeWidth={3}
        strokeLinecap="round"
        mask={`url(#mask-${id})`}
        initial={{ strokeDasharray: "100 1000", strokeDashoffset: isDescending ? 600 : -600 }}
        animate={{ strokeDashoffset: isDescending ? [-600, 600] : [600, -600] }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ filter: "blur(2px)" }}
      />

      <motion.path
        d={path}
        fill="none"
        stroke={accent}
        strokeWidth={1.5}
        strokeLinecap="round"
        mask={`url(#mask-${id})`}
        animate={{ opacity: [0.1, 0.4, 0.1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    </g>
  );
}
