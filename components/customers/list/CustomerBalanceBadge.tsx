// filepath: components/customers/list/CustomerBalanceBadge.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

interface CustomerBalanceBadgeProps {
  balance: number;
}

export function CustomerBalanceBadge({ balance }: CustomerBalanceBadgeProps) {
  const hasBalance = balance > 0;

  return (
    <div className="flex flex-col items-end shrink-0 pl-2">
      <span
        className={cn(
          "font-mono font-bold tracking-tight tabular-nums",
          hasBalance ? "text-base text-[#DC2626]" : "text-sm text-[#78716C]"
        )}
      >
        Rs {balance.toLocaleString()}
      </span>
      <span className="text-[10px] text-[#78716C] mt-0.5">
        {hasBalance ? "Balance due" : "Clear"}
      </span>
    </div>
  );
}
