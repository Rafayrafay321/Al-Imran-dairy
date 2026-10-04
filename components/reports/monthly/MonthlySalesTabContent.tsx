// filepath: components/reports/monthly/MonthlySalesTabContent.tsx
import * as React from "react";
import { SalesMonthPicker } from "./SalesMonthPicker";
import { MonthlySalesTable } from "./MonthlySalesTable";
import { type SalesReportCustomerRow } from "@/lib/data/types";
import { EmptyState } from "@/components/common/EmptyState";

interface MonthlySalesTabContentProps {
  selectedMonth: string;
  sales: SalesReportCustomerRow[];
  totalLiters: number;
  totalAmount: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function MonthlySalesTabContent({
  selectedMonth,
  sales,
  totalLiters,
  totalAmount,
  onPrevMonth,
  onNextMonth,
}: MonthlySalesTabContentProps) {
  const monthLabel = new Intl.DateTimeFormat("en-PK", {
    month: "long",
    year: "numeric",
  }).format(new Date(`${selectedMonth}-01T00:00:00`));

  return (
    <div className="space-y-3.5">
      <SalesMonthPicker
        currentMonth={monthLabel}
        onPrevMonth={onPrevMonth}
        onNextMonth={onNextMonth}
      />

      {sales.length === 0 ? <EmptyState message="No bills generated for this period." /> : <MonthlySalesTable
        sales={sales}
        totalLiters={totalLiters}
        totalAmount={totalAmount}
      />}
    </div>
  );
}
