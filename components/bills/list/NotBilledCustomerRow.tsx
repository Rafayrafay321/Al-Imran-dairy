"use client";

import Link from "next/link";
import { useConnectivity } from "@/components/common/ConnectivityProvider";
import { type NotBilledCustomer } from "@/lib/services/invoiceService";
import { formatRupees } from "@/lib/data/money";

export function NotBilledCustomerRow({ customer }: { customer: NotBilledCustomer }) {
  const { isOffline } = useConnectivity();
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white p-4">
      <div className="min-w-0"><p className="truncate text-sm font-bold text-stone-900">{customer.name}</p><p className="mt-0.5 text-xs text-stone-600">Previous balance: Rs {formatRupees(customer.balance)}</p></div>
      {isOffline ? <span aria-disabled="true" className="flex min-h-11 shrink-0 items-center rounded-xl bg-blue-600 px-3 text-xs font-bold text-white opacity-50">Create Bill</span> : <Link href={`/bills/new?customerId=${customer.id}`} className="flex min-h-11 shrink-0 items-center rounded-xl bg-blue-600 px-3 text-xs font-bold text-white focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">Create Bill</Link>}
    </div>
  );
}
