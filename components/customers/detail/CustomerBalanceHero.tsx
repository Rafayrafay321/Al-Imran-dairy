// filepath: components/customers/detail/CustomerBalanceHero.tsx
import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CustomerBalanceHeroProps {
  balance: number;
}

export function CustomerBalanceHero({ balance }: CustomerBalanceHeroProps) {
  const hasBalance = balance > 0;

  return (
    <Card className="w-full bg-white border border-[#E7E5E4] rounded-2xl shadow-xs">
      <CardContent className="p-5 text-center space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider text-[#78716C] block">
          Current Balance
        </span>

        <div className="pt-1">
          <span
            className={cn(
              "text-4xl sm:text-5xl font-black font-mono tracking-tight tabular-nums",
              hasBalance ? "text-[#DC2626]" : "text-[#1C1917]"
            )}
          >
            Rs {balance.toLocaleString()}
          </span>
        </div>

        <p className="text-xs text-[#78716C] pt-0.5">
          {hasBalance ? "Outstanding amount to be collected" : "All payments are up to date"}
        </p>
      </CardContent>
    </Card>
  );
}
