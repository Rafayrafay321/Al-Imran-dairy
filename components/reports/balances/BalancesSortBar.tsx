// filepath: components/reports/balances/BalancesSortBar.tsx
import * as React from "react";
import { ArrowUpDown } from "lucide-react";
import { type BalancesSortOrder } from "@/hooks/useReportsData";

interface BalancesSortBarProps {
  totalOutstanding: number;
  sortOrder: BalancesSortOrder;
  onToggleSort: () => void;
}

export function BalancesSortBar({
  totalOutstanding,
  sortOrder,
  onToggleSort,
}: BalancesSortBarProps) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-stone-100 p-3 border border-[#E7E5E4]">
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78716C] block">
          Total Outstanding
        </span>
        <span className="font-mono font-black text-lg text-[#DC2626]">
          Rs {totalOutstanding.toLocaleString()}
        </span>
      </div>

      <button
        type="button"
        onClick={onToggleSort}
        className="flex h-10 items-center gap-1.5 rounded-lg border border-[#E7E5E4] bg-white px-3 text-xs font-semibold text-[#1C1917] hover:bg-stone-50 active:scale-95 transition-all shadow-2xs"
      >
        <ArrowUpDown className="h-3.5 w-3.5 text-[#78716C]" />
        <span>{sortOrder === "balance_desc" ? "Highest First" : "Name A-Z"}</span>
      </button>
    </div>
  );
}
