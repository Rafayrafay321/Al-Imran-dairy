// filepath: components/reports/daily/DailyDatePicker.tsx
import * as React from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface DailyDatePickerProps {
  selectedDate: string;
  onPrevDay: () => void;
  onNextDay: () => void;
}

export function DailyDatePicker({
  selectedDate,
  onPrevDay,
  onNextDay,
}: DailyDatePickerProps) {
  const formatted = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(selectedDate));

  return (
    <div className="flex h-14 w-full items-center justify-between rounded-2xl border border-[#E7E5E4] bg-white px-2 py-1 shadow-2xs">
      <button
        type="button"
        onClick={onPrevDay}
        className="flex h-11 w-11 items-center justify-center rounded-xl text-[#78716C] hover:bg-stone-100 active:bg-stone-200 transition-colors"
        aria-label="Previous day"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-[#2563EB]" />
        <span className="text-base font-bold text-[#1C1917]">
          {formatted}
        </span>
      </div>

      <button
        type="button"
        onClick={onNextDay}
        className="flex h-11 w-11 items-center justify-center rounded-xl text-[#78716C] hover:bg-stone-100 active:bg-stone-200 transition-colors"
        aria-label="Next day"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
