// filepath: components/home/summary/SummaryMetricItem.tsx
import * as React from "react";

interface SummaryMetricItemProps {
  label: string;
  value: string;
}

export function SummaryMetricItem({
  label,
  value,
}: SummaryMetricItemProps) {
  return (
    <div className="flex flex-col min-w-0">
      <span className="text-xs font-semibold text-[#78716C]">{label}</span>
      <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1C1917] font-mono mt-1 tabular-nums truncate">
        {value}
      </span>
    </div>
  );
}
