import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { formatWeekLabel, getCalendarWeek } from "@/lib/week";

interface WeekPickerProps {
  weekStart: string;
  weekEnd: string;
  onShiftWeek: (offsetWeeks: number) => void;
}

export function WeekPicker({ weekStart, weekEnd, onShiftWeek }: WeekPickerProps) {
  const isCurrentWeek = weekStart >= getCalendarWeek().weekStart;

  return (
    <div className="flex items-center justify-between rounded-2xl border border-[#E7E5E4] bg-white p-3.5 shadow-xs">
      <button type="button" onClick={() => onShiftWeek(-1)} aria-label="Previous week" className="flex h-11 w-11 items-center justify-center rounded-xl text-[#78716C] transition-all hover:bg-stone-100 active:scale-90">
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-2.5 text-center">
        <CalendarDays className="h-4 w-4 text-[#2563EB]" />
        <div>
          <p className="text-sm font-bold text-[#1C1917]">{formatWeekLabel({ weekStart, weekEnd })}</p>
          <p className="font-mono text-[10px] text-[#78716C]">Monday to Sunday</p>
        </div>
      </div>

      <button type="button" onClick={() => onShiftWeek(1)} disabled={isCurrentWeek} aria-label="Next week" className="flex h-11 w-11 items-center justify-center rounded-xl text-[#78716C] transition-all hover:bg-stone-100 active:scale-90 disabled:cursor-not-allowed disabled:opacity-30">
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
