// filepath: components/reports/daily/DailyEntryRow.tsx
import * as React from "react";
import { UserCheck } from "lucide-react";
import { type WeeklySummaryEntry } from "@/lib/data/types";

interface DailyEntryRowProps {
  entry: WeeklySummaryEntry;
}

export function DailyEntryRow({ entry }: DailyEntryRowProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[#E7E5E4] bg-white p-3.5 shadow-2xs">
      <div className="min-w-0 pr-2">
        <span className="font-bold text-base text-[#1C1917] block truncate">
          {entry.customerName}
        </span>
        <div className="flex items-center gap-1.5 text-xs text-[#78716C] mt-1">
          <span className="capitalize">{entry.milkType}</span>
          <span>•</span>
          <span className="font-mono font-medium">{entry.liters} L @ Rs {entry.rate}</span>
        </div>
      </div>

      <div className="text-right shrink-0">
        <span className="font-mono font-bold text-base text-[#1C1917] block tabular-nums">
          Rs {entry.amount.toLocaleString()}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] text-[#78716C] mt-0.5">
          <UserCheck className="h-3 w-3" />
          <span>{entry.recordedBy || entry.staffName}</span>
        </span>
      </div>
    </div>
  );
}
