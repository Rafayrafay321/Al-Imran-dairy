// filepath: components/reports/monthly/SalesMonthPicker.tsx
import * as React from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface SalesMonthPickerProps {
  currentMonth: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function SalesMonthPicker({
  currentMonth,
  onPrevMonth,
  onNextMonth,
}: SalesMonthPickerProps) {
  return (
    <div className="flex h-14 w-full items-center justify-between rounded-2xl border border-[#E7E5E4] bg-white px-2 py-1 shadow-2xs">
      <button
        type="button"
        onClick={onPrevMonth}
        className="flex h-11 w-11 items-center justify-center rounded-xl text-[#78716C] hover:bg-stone-100 active:bg-stone-200 transition-colors"
        aria-label="Previous month"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-[#2563EB]" />
        <span className="text-base font-bold text-[#1C1917]">
          {currentMonth}
        </span>
      </div>

      <button
        type="button"
        onClick={onNextMonth}
        className="flex h-11 w-11 items-center justify-center rounded-xl text-[#78716C] hover:bg-stone-100 active:bg-stone-200 transition-colors"
        aria-label="Next month"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
