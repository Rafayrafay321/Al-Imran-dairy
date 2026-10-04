// filepath: components/reports/daily/DailySummaryBanner.tsx
import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface DailySummaryBannerProps {
  totalLiters: number;
  totalAmount: number;
}

export function DailySummaryBanner({
  totalLiters,
  totalAmount,
}: DailySummaryBannerProps) {
  return (
    <Card className="w-full bg-white border border-[#E7E5E4] rounded-2xl shadow-xs">
      <CardContent className="p-4 grid grid-cols-2 gap-4">
        <div>
          <span className="text-xs font-semibold text-[#78716C] block">
            Day&apos;s Volume
          </span>
          <span className="font-mono font-bold text-2xl text-[#1C1917] mt-1 block tabular-nums">
            {totalLiters} L
          </span>
        </div>

        <div className="border-l border-[#E7E5E4] pl-4">
          <span className="text-xs font-semibold text-[#78716C] block">
            Day&apos;s Sales
          </span>
          <span className="font-mono font-bold text-2xl text-[#2563EB] mt-1 block tabular-nums">
            Rs {totalAmount.toLocaleString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
