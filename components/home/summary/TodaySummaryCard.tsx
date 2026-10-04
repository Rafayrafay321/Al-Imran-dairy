// filepath: components/home/summary/TodaySummaryCard.tsx
import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { SummaryMetricItem } from "./SummaryMetricItem";
import { type TodayMetrics } from "@/lib/data/types";

interface TodaySummaryCardProps {
  metrics: TodayMetrics;
}

export function TodaySummaryCard({ metrics }: TodaySummaryCardProps) {
  return (
    <Card className="w-full shadow-xs bg-white border border-[#E7E5E4] rounded-2xl">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-[#E7E5E4]">
          <h3 className="text-sm font-bold text-[#1C1917] tracking-tight">
            Today&apos;s Activity
          </h3>
          <span className="text-xs text-[#78716C] font-medium">
            Overview
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          <SummaryMetricItem
            label="Total Liters"
            value={`${metrics.totalLiters} L`}
          />
          <SummaryMetricItem
            label="Bills"
            value={metrics.billsCount.toString()}
          />
        </div>
      </CardContent>
    </Card>
  );
}
