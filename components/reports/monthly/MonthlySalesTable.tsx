// filepath: components/reports/monthly/MonthlySalesTable.tsx
import * as React from "react";
import { type SalesReportCustomerRow } from "@/lib/data/types";

interface MonthlySalesTableProps {
  sales: SalesReportCustomerRow[];
  totalLiters: number;
  totalAmount: number;
}

export function MonthlySalesTable({
  sales,
  totalLiters,
  totalAmount,
}: MonthlySalesTableProps) {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-[#E7E5E4] bg-white shadow-xs">
        <table className="w-full table-fixed text-left text-xs">
          <thead>
            <tr className="border-b border-[#E7E5E4] bg-stone-50 text-xs font-bold uppercase tracking-wider text-[#78716C]">
              <th className="w-[45%] px-3 py-3">Customer</th>
              <th className="w-[22%] px-1 py-3 text-end">Liters</th>
              <th className="w-[33%] px-3 py-3 text-end">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E7E5E4]">
            {sales.map((item) => (
              <tr key={item.customerId} className="hover:bg-stone-50/50">
                <td className="truncate px-3 py-3.5 font-bold text-[#1C1917]" title={item.customerName}>
                  {item.customerName}
                </td>
                <td className="px-1 py-3.5 text-end font-mono text-[#78716C] tabular-nums whitespace-nowrap">
                  {item.totalLiters} L
                </td>
                <td className="px-3 py-3.5 text-end font-mono font-bold text-[#1C1917] tabular-nums whitespace-nowrap">
                  Rs {item.totalAmount.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
          {/* Prominent Total Row */}
          <tfoot>
            <tr className="border-t-2 border-[#1C1917] bg-stone-100 font-extrabold text-[#1C1917]">
              <td className="px-3 py-3.5 text-sm">Total</td>
              <td className="px-1 py-3.5 text-end font-mono text-sm tabular-nums whitespace-nowrap">
                {totalLiters} L
              </td>
              <td className="px-3 py-3.5 text-end font-mono text-sm tabular-nums text-[#2563EB] whitespace-nowrap">
                Rs {totalAmount.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
    </div>
  );
}
