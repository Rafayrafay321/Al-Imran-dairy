// filepath: components/customers/detail/tabs/DetailTabsNav.tsx
import * as React from "react";
import { type DetailTabType } from "@/hooks/useCustomerDetail";
import { cn } from "@/lib/utils";

interface DetailTabsNavProps {
  activeTab: DetailTabType;
  onChangeTab: (tab: DetailTabType) => void;
}

const TABS: { id: DetailTabType; label: string }[] = [
  { id: "invoices", label: "Invoices" },
  { id: "payments", label: "Payments" },
  { id: "rates", label: "Rates" },
];

export function DetailTabsNav({
  activeTab,
  onChangeTab,
}: DetailTabsNavProps) {
  return (
    <div className="flex w-full rounded-xl bg-stone-100 p-1 border border-[#E7E5E4]">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChangeTab(tab.id)}
            className={cn(
              "flex h-11 flex-1 items-center justify-center rounded-lg text-xs font-bold transition-all select-none",
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
