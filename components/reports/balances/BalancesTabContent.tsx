// filepath: components/reports/balances/BalancesTabContent.tsx
import * as React from "react";
import { BalancesSortBar } from "./BalancesSortBar";
import { CustomerBalanceRow } from "./CustomerBalanceRow";
import { type Customer } from "@/lib/data/types";
import { type BalancesSortOrder } from "@/hooks/useReportsData";
import { EmptyState } from "@/components/common/EmptyState";

interface BalancesTabContentProps {
  customers: Customer[];
  totalOutstanding: number;
  sortOrder: BalancesSortOrder;
  onToggleSort: () => void;
  onSendReminder: (customer: Customer) => void;
}

export function BalancesTabContent({
  customers,
  totalOutstanding,
  sortOrder,
  onToggleSort,
  onSendReminder,
}: BalancesTabContentProps) {
  if (customers.length === 0) return <EmptyState message="All customers are settled. 🎉" />;
  return (
    <div className="space-y-3.5">
      <BalancesSortBar
        totalOutstanding={totalOutstanding}
        sortOrder={sortOrder}
        onToggleSort={onToggleSort}
      />

      <div className="space-y-2.5">
        {customers.map((customer) => (
          <CustomerBalanceRow
            key={customer.id}
            customer={customer}
            onSendReminder={onSendReminder}
          />
        ))}
      </div>
    </div>
  );
}
