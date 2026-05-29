import { ChevronLeft, ChevronRight } from "lucide-react";
import { getMoodGradient, toDateKey } from "../utils/capsuleDays";

interface MonthCalendarProps {
  year: number;
  month: number;
  filledDates: Map<string, string>;
  selectedDateKey: string | null;
  onSelectDate: (dateKey: string) => void;
  onMonthChange: (year: number, month: number) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MonthCalendar({
  year,
  month,
  filledDates,
  selectedDateKey,
  onSelectDate,
  onMonthChange,
}: MonthCalendarProps) {
  const todayKey = toDateKey(new Date());
  const firstOfMonth = new Date(year, month, 1);
  const startPad = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, month, d, 12, 0, 0, 0));
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const monthLabel = firstOfMonth.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  const goMonth = (delta: number) => {
    const next = new Date(year, month + delta, 1);
    onMonthChange(next.getFullYear(), next.getMonth());
  };

  return (
    <div className="max-w-sm mx-auto rounded-2xl p-4 sm:p-5 text-zinc-900">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => goMonth(-1)}
          className="p-2 rounded-full hover:text-white transition-colors text-zinc-400"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-white sm:text-lg font-semibold tracking-tight">{monthLabel}</h2>
        <button
          type="button"
          onClick={() => goMonth(1)}
          className="p-2 rounded-lg hover:text-white transition-colors text-zinc-400"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-[10px] sm:text-xs font-medium text-zinc-400 uppercase tracking-wide py-1"
          >
            {day[0]}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((date, i) => {
          if (!date) {
            return <div key={`empty-${i}`} className="aspect-square" />;
          }

          const dateKey = toDateKey(date);
          const mood = filledDates.get(dateKey);
          const isFilled = !!mood;
          const isSelected = selectedDateKey === dateKey;
          const isToday = dateKey === todayKey;

          return (
            <button
              key={dateKey}
              type="button"
              disabled={!isFilled}
              onClick={() => isFilled && onSelectDate(dateKey)}
              className={`
                group relative aspect-square rounded-full flex items-center justify-center 
                text-[13px] font-medium tabular-nums transition-all duration-300
                ${isFilled ? "text-white" : "text-zinc-400"}
                ${isSelected ? "scale-110" : "hover:scale-90"}
              `}
              aria-pressed={isSelected}
            >
              {/* Blurred Gradient Background */}
              {isFilled && (
                <div 
                  className={`
                    absolute inset-0 rounded-full transition-transform duration-300
                    ${isSelected ? 'scale-100 opacity-80' : 'scale-75 opacity-50'}
                  `}
                  style={{ 
                    background: getMoodGradient(mood!),
                    filter: 'blur(10px)',
                    // opacity: 0.8
                  }} 
                />
              )}

              {/* Date Label */}
              <span className="relative z-10">
                {date.getDate()}
              </span>

              {/* Today Indicator (Small Dot) */}
              {isToday && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-zinc-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
