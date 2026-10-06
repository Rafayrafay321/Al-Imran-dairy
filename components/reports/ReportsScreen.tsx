// filepath: components/reports/ReportsScreen.tsx
"use client";

import * as React from "react";
import { useReportsData, type ReportsInitialData } from "@/hooks/useReportsData";
import { ReportsHeader } from "./header/ReportsHeader";
import { ReportsTabsNav } from "./header/ReportsTabsNav";
import { BalancesTabContent } from "./balances/BalancesTabContent";
import { MonthlySalesTabContent } from "./monthly/MonthlySalesTabContent";
import { DailyTabContent } from "./daily/DailyTabContent";
import { PageSkeleton } from "@/components/common/PageSkeleton";

interface ReportsScreenProps {
  onBack?: () => void;
  initialData?: ReportsInitialData;
  showHeader?: boolean;
}

export function ReportsScreen({ onBack, initialData, showHeader = true }: ReportsScreenProps) {
  const {
    isLoading,
    error,
    activeTab,
    setActiveTab,
    customersWithBalance,
    totalOutstandingBalance,
    balanceSort,
    setBalanceSort,
    handleSendReminder,
    selectedMonth,
    shiftSelectedMonth,
    monthlySales,
    monthlyTotalLiters,
    monthlyTotalAmount,
    selectedDate,
    shiftSelectedDate,
    dailyEntries,
    dailyTotalLiters,
    dailyTotalAmount,
  } = useReportsData(initialData);

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#FAFAF9] overflow-x-hidden">
      {/* Top Header */}
      {showHeader && <ReportsHeader onBack={onBack} />}

      {/* Main Container */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-5 sm:px-6 space-y-4 pb-12">
        {/* Simple Tab Bar: Balances, Monthly Sales, Daily */}
        <ReportsTabsNav
          activeTab={activeTab}
          onChangeTab={setActiveTab}
        />

        {isLoading ? <PageSkeleton rows={4} /> : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>
        ) : activeTab === "balances" ? (
          <BalancesTabContent
            customers={customersWithBalance}
            totalOutstanding={totalOutstandingBalance}
            sortOrder={balanceSort}
            onToggleSort={() =>
              setBalanceSort((prev) =>
                prev === "balance_desc" ? "name_asc" : "balance_desc"
              )
            }
            onSendReminder={handleSendReminder}
          />
        ) : null}

        {/* Tab 2: Monthly Sales */}
        {!isLoading && !error && activeTab === "monthly" && (
          <MonthlySalesTabContent
            selectedMonth={selectedMonth}
            sales={monthlySales}
            totalLiters={monthlyTotalLiters}
            totalAmount={monthlyTotalAmount}
            onPrevMonth={() => shiftSelectedMonth(-1)}
            onNextMonth={() => shiftSelectedMonth(1)}
          />
        )}

        {/* Tab 3: Daily */}
        {!isLoading && !error && activeTab === "daily" && (
          <DailyTabContent
            selectedDate={selectedDate}
            entries={dailyEntries}
            totalLiters={dailyTotalLiters}
            totalAmount={dailyTotalAmount}
            onPrevDay={() => shiftSelectedDate(-1)}
            onNextDay={() => shiftSelectedDate(1)}
          />
        )}
      </main>
    </div>
  );
}
