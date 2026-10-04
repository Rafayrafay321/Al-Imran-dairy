// filepath: components/reports/balances/CustomerBalanceRow.tsx
import * as React from "react";
import { MessageCircle } from "lucide-react";
import { type Customer } from "@/lib/data/types";
import { cn } from "@/lib/utils";
import { useConnectivity } from "@/components/common/ConnectivityProvider";

interface CustomerBalanceRowProps {
  customer: Customer;
  onSendReminder: (customer: Customer) => void;
}

export function CustomerBalanceRow({
  customer,
  onSendReminder,
}: CustomerBalanceRowProps) {
  const { isOffline } = useConnectivity();
  const hasBalance = customer.previousBalance > 0;

  return (
    <div className="flex min-h-[68px] items-center justify-between rounded-2xl border border-[#E7E5E4] bg-white p-3.5 shadow-2xs">
      <div className="min-w-0 pr-2">
        <span className="font-bold text-base text-[#1C1917] block truncate">
          {customer.name}
        </span>
        <span className="text-xs text-[#78716C] font-mono mt-0.5 block">
          {customer.phone}
        </span>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <span
            className={cn(
              "font-mono font-bold text-base block tabular-nums",
              hasBalance ? "text-[#DC2626]" : "text-[#78716C]"
            )}
          >
            Rs {customer.previousBalance.toLocaleString()}
          </span>
          <span className="text-[10px] text-[#78716C]">
            {hasBalance ? "Due" : "Clear"}
          </span>
        </div>

        {hasBalance ? (
          <button
            type="button"
            onClick={() => onSendReminder(customer)}
            disabled={isOffline}
            className="flex h-11 items-center gap-1.5 rounded-xl bg-[#16803C] px-3 text-white text-xs font-bold hover:bg-green-800 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2 transition-all shadow-xs"
            aria-label={`Send payment reminder to ${customer.name}`}
          >
            <MessageCircle className="h-4 w-4 stroke-[2.2]" />
            <span className="hidden sm:inline">Remind</span>
          </button>
        ) : (
          <div className="w-11" />
        )}
      </div>
    </div>
  );
}
