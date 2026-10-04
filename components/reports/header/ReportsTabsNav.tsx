// filepath: components/reports/header/ReportsTabsNav.tsx
import * as React from "react";
import { type ReportsTabType } from "@/hooks/useReportsData";
import { cn } from "@/lib/utils";

interface ReportsTabsNavProps {
  activeTab: ReportsTabType;
  onChangeTab: (tab: ReportsTabType) => void;
}

const TABS: { id: ReportsTabType; label: string }[] = [
  { id: "balances", label: "Balances" },
  { id: "monthly", label: "Monthly Sales" },
  { id: "daily", label: "Weekly Summary" },
];

export function ReportsTabsNav({
  activeTab,
  onChangeTab,
}: ReportsTabsNavProps) {
  return (
    <div className="flex w-full rounded-xl bg-stone-100 p-1 border border-[#E7E5E4] select-none">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChangeTab(tab.id)}
            className={cn(
              "flex h-11 flex-1 items-center justify-center rounded-lg text-xs font-bold transition-all",
              isActive
                ? "bg-white text-[#1C1917] shadow-2xs"
                : "text-[#78716C] hover:text-[#1C1917]"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
