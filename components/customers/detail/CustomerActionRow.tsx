// filepath: components/customers/detail/CustomerActionRow.tsx
import * as React from "react";
import { PlusCircle, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CustomerActionRowProps {
  onNewBill: () => void;
  onRecordPayment: () => void;
}

export function CustomerActionRow({
  onNewBill,
  onRecordPayment,
}: CustomerActionRowProps) {
  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      <Button
        type="button"
        variant="primary"
        size="default"
        onClick={onNewBill}
        className="gap-2 text-sm font-bold shadow-xs"
        requiresOnline
      >
        <PlusCircle className="h-4 w-4" />
        <span>New Bill</span>
      </Button>

      <Button
        type="button"
        variant="outline"
        size="default"
        onClick={onRecordPayment}
        className="gap-2 text-sm font-bold border-[#E7E5E4] text-[#1C1917] shadow-xs"
        requiresOnline
      >
        <Wallet className="h-4 w-4 text-[#78716C]" />
        <span>Record Payment</span>
      </Button>
    </div>
  );
}
