// filepath: components/bills/create/BillSummaryCard.tsx
import * as React from "react";
import { formatRupees } from "@/lib/data/money";

interface BillSummaryCardProps {
  totalLiters: number;
  subtotal: number;
  previousBalance: number;
  grandTotal: number;
}

export function BillSummaryCard({
  totalLiters,
  subtotal,
  previousBalance,
  grandTotal,
}: BillSummaryCardProps) {
  return (
    <div className="rounded-2xl border border-[#E7E5E4] bg-white p-4 shadow-xs space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
        Bill Summary
      </h3>

      <div className="space-y-2 text-sm divide-y divide-stone-100">
        <div className="flex justify-between items-center text-stone-600">
          <span>Total Liters</span>
          <span className="font-bold text-stone-900">{totalLiters} L</span>
        </div>

        <div className="flex justify-between items-center text-stone-600 pt-2">
          <span>This Week&apos;s Amount</span>
          <span className="font-bold text-stone-900">Rs {formatRupees(subtotal)}</span>
        </div>

        <div className="flex justify-between items-center text-stone-600 pt-2">
          <span>Previous Balance</span>
          <span className="font-bold text-[#DC2626]">
            Rs {formatRupees(previousBalance)}
          </span>
        </div>

        <div className="flex justify-between items-center pt-2.5">
          <span className="text-base font-bold text-[#1C1917]">Total Payable</span>
          <span className="text-xl font-extrabold text-[#2563EB]">
            Rs {formatRupees(grandTotal)}
          </span>
        </div>
      </div>
    </div>
  );
}
