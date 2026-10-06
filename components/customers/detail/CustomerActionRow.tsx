// filepath: components/customers/detail/CustomerActionRow.tsx
import * as React from "react";
import Link from "next/link";
import { PlusCircle, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CustomerActionRowProps {
  newBillHref: string;
  onRecordPayment: () => void;
}

export function CustomerActionRow({
  newBillHref,
  onRecordPayment,
}: CustomerActionRowProps) {
  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      <Link href={newBillHref} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-xs focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">
        <PlusCircle className="h-4 w-4" />
        <span>New Bill</span>
      </Link>

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
