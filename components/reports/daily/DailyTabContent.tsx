// filepath: components/reports/daily/DailyTabContent.tsx
import * as React from "react";
import { DailyDatePicker } from "./DailyDatePicker";
import { DailySummaryBanner } from "./DailySummaryBanner";
import { DailyEntryRow } from "./DailyEntryRow";
import { type WeeklySummaryEntry } from "@/lib/data/types";
import { EmptyState } from "@/components/common/EmptyState";

interface DailyTabContentProps {
  selectedDate: string;
  entries: WeeklySummaryEntry[];
  totalLiters: number;
  totalAmount: number;
  onPrevDay: () => void;
  onNextDay: () => void;
}

export function DailyTabContent({
  selectedDate,
  entries,
  totalLiters,
  totalAmount,
  onPrevDay,
  onNextDay,
}: DailyTabContentProps) {
  return (
    <div className="space-y-3.5">
      <DailyDatePicker
        selectedDate={selectedDate}
        onPrevDay={onPrevDay}
        onNextDay={onNextDay}
      />

      <DailySummaryBanner
        totalLiters={totalLiters}
        totalAmount={totalAmount}
      />

      <div className="space-y-2 pt-1">
        <span className="text-xs font-bold uppercase tracking-wider text-[#78716C] block px-1">
          Entries for {selectedDate}
        </span>
        {entries.length === 0 ? <EmptyState message="No activity in this period." /> : entries.map((entry) => (
          <DailyEntryRow key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
