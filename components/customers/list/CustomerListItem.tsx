// filepath: components/customers/list/CustomerListItem.tsx
import * as React from "react";
import { ChevronRight, Phone } from "lucide-react";
import { CustomerBalanceBadge } from "./CustomerBalanceBadge";

interface CustomerListItemData {
  id: string;
  name: string;
  nameUrdu?: string;
  phone: string;
  balance?: number;
  previousBalance?: number;
  isActive?: boolean;
}

interface CustomerListItemProps {
  customer: CustomerListItemData;
  onClick: (customerId: string) => void;
}

export function CustomerListItem({ customer, onClick }: CustomerListItemProps) {
  const currentBalance = customer.balance !== undefined ? customer.balance : (customer.previousBalance || 0);

  return (
    <button
      type="button"
      onClick={() => onClick(customer.id)}
      className="flex w-full min-h-[72px] items-center justify-between rounded-2xl border border-[#E7E5E4] bg-white p-4 text-left transition-all hover:bg-stone-50 active:scale-[0.99] shadow-2xs focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
    >
      <div className="flex flex-col min-w-0 pr-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-base text-[#1C1917] truncate">
            {customer.name}
          </span>
          {customer.isActive === false && <span className="rounded-full bg-stone-200 px-2 py-0.5 text-[10px] font-bold text-stone-700">Inactive</span>}
          {customer.nameUrdu && (
            <span className="text-xs text-[#78716C] hidden sm:inline" dir="rtl">
              {customer.nameUrdu}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-[#78716C] mt-1">
          <span className="flex items-center gap-1 font-mono">
            <Phone className="h-3 w-3 shrink-0" />
            {customer.phone}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <CustomerBalanceBadge balance={currentBalance} />
        <ChevronRight className="h-4 w-4 text-[#78716C] shrink-0" />
      </div>
    </button>
  );
}
