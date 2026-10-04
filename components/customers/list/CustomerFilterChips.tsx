// filepath: components/customers/list/CustomerFilterChips.tsx
import * as React from "react";
import { type CustomerFilterType } from "@/hooks/useCustomersList";
import { cn } from "@/lib/utils";

interface CustomerFilterChipsProps {
  activeFilter: CustomerFilterType;
  onSelectFilter: (filter: CustomerFilterType) => void;
}

const FILTERS: { id: CustomerFilterType; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "HAS_BALANCE", label: "Has Balance" },
  { id: "INACTIVE", label: "Inactive" },
];

export function CustomerFilterChips({
  activeFilter,
  onSelectFilter,
}: CustomerFilterChipsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 select-none -mx-4 px-4 sm:mx-0 sm:px-0">
      {FILTERS.map((chip) => {
        const isActive = activeFilter === chip.id;
        return (
          <button
            key={chip.id}
            type="button"
            onClick={() => onSelectFilter(chip.id)}
            className={cn(
              "flex h-10 shrink-0 items-center justify-center rounded-full px-4 text-xs font-semibold transition-all active:scale-95",
              isActive
                ? "bg-[#2563EB] text-white shadow-xs"
                : "bg-white text-[#78716C] border border-[#E7E5E4] hover:bg-stone-50"
            )}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
