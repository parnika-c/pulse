import { useEffect, useMemo, useState } from "react";
import { DailyCard } from "../App";
import { ThreadSentence } from "./ThreadSentence";
import { ThreadList } from "./ThreadRail";
import { MonthCalendar } from "./MonthCalendar";
import { Calendar } from "lucide-react";
import type { ThreadConnection } from "../utils/threadConnections";
import {
  buildCapsuleDayMap,
  clampViewMonth,
  dateKeyToDate,
  getEarliestDateKey,
  getLatestDateKey,
  toDateKey,
} from "../utils/capsuleDays";

interface TimeCapsuleProps {
  archivedDays: DailyCard[][];
  todayThreadCards: DailyCard[];
}

export function TimeCapsule({ archivedDays, todayThreadCards }: TimeCapsuleProps) {
  const [selectedConnection, setSelectedConnection] = useState<ThreadConnection | null>(null);
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  const dayMap = useMemo(
    () => buildCapsuleDayMap(archivedDays, todayThreadCards),
    [archivedDays, todayThreadCards]
  );

  const filledDates = useMemo(() => {
    const map = new Map<string, string>();
    dayMap.forEach((day, key) => map.set(key, day.mood));
    return map;
  }, [dayMap]);

  const earliestMonth = useMemo(() => {
    const key = getEarliestDateKey(dayMap);
    if (!key) return null;
    const d = dateKeyToDate(key);
    return { year: d.getFullYear(), month: d.getMonth() };
  }, [dayMap]);

  const currentMonth = useMemo(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  }, []);

  useEffect(() => {
    if (selectedDateKey && dayMap.has(selectedDateKey)) return;
    const todayKey = toDateKey(new Date());
    if (dayMap.has(todayKey)) {
      setSelectedDateKey(todayKey);
      return;
    }
    const latest = getLatestDateKey(dayMap);
    if (latest) {
      setSelectedDateKey(latest);
      const d = dateKeyToDate(latest);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [dayMap, selectedDateKey]);

  const selectedDay = selectedDateKey ? dayMap.get(selectedDateKey) : undefined;
  const hasAnyDays = dayMap.size > 0;

  useEffect(() => {
    const clamped = clampViewMonth(viewYear, viewMonth, earliestMonth, currentMonth);
    if (clamped.year !== viewYear || clamped.month !== viewMonth) {
      setViewYear(clamped.year);
      setViewMonth(clamped.month);
    }
  }, [viewYear, viewMonth, earliestMonth, currentMonth]);

  const handleMonthChange = (year: number, month: number) => {
    const clamped = clampViewMonth(year, month, earliestMonth, currentMonth);
    setViewYear(clamped.year);
    setViewMonth(clamped.month);
  };

  const handleSelectDate = (dateKey: string) => {
    setSelectedDateKey(dateKey);
    setSelectedConnection(null);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <MonthCalendar
        year={viewYear}
        month={viewMonth}
        filledDates={filledDates}
        selectedDateKey={selectedDateKey}
        onSelectDate={handleSelectDate}
        onMonthChange={handleMonthChange}
        earliestYear={earliestMonth?.year}
        earliestMonth={earliestMonth?.month}
      />

      {selectedDay ? (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-5">
            <Calendar className="w-4 h-4 text-zinc-500" />
            <p className="text-xs uppercase tracking-wider text-zinc-500">
              {selectedDay.date.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <ThreadList
            cards={selectedDay.cards}
            selectedConnectionId={selectedConnection?.id ?? null}
            onSelectConnection={setSelectedConnection}
            renderCard={(index) => <ThreadSentence card={selectedDay.cards[index]} />}
          />
        </div>
      ) : hasAnyDays ? (
        <p className="mt-8 text-center text-sm text-zinc-500">
          Select a highlighted date to revisit that day&apos;s thread
        </p>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-zinc-700" />
          </div>
          <p className="text-sm text-zinc-500 mb-1">No pulses archived yet</p>
          <p className="text-xs text-zinc-500 max-w-xs">
            Post your daily pulse and it will appear on the calendar
          </p>
        </div>
      )}
    </div>
  );
}
