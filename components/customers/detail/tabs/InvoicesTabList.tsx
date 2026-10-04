import * as React from "react";
import Link from "next/link";
import { ChevronRight, Receipt } from "lucide-react";
import { type Invoice } from "@/lib/data/types";
import { type InvoiceDetail } from "@/lib/services/invoiceService";
import { formatRupees } from "@/lib/data/money";
import { EmptyState } from "@/components/common/EmptyState";

interface InvoicesTabListProps {
  invoices: (Invoice | InvoiceDetail)[];
}

function formatSentDate(sharedAt?: string | null) {
  if (!sharedAt) return "Not sent yet";

  return `Sent ${new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(sharedAt))}`;
}

export function InvoicesTabList({ invoices }: InvoicesTabListProps) {
  if (invoices.length === 0) {
    return <EmptyState message="No bills for this customer yet." actionLabel="Create Bill" actionHref="/bills/new" />;
  }

  return (
    <div className="space-y-2">
      {invoices.map((invoice) => (
        <Link
          key={invoice.id}
          href={`/bills/${invoice.id}`}
          aria-label={`Open invoice ${invoice.invoiceNo}`}
          className="flex items-center justify-between rounded-xl border border-[#E7E5E4] bg-white p-3.5 shadow-2xs transition-colors hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB]">
              <Receipt className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span className="block font-mono text-xs font-bold text-[#1C1917]">
                {invoice.invoiceNo}
              </span>
              <span className="block text-[11px] text-[#78716C]">
                {invoice.weekStart} – {invoice.weekEnd} • {invoice.totalLiters} L
              </span>
              <span className="mt-0.5 block text-[11px] text-[#78716C]">
                {formatSentDate(invoice.sharedAt)}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="text-end">
              <span className="block font-mono text-sm font-bold text-[#1C1917]">
                Rs {formatRupees(invoice.totalAmount)}
              </span>
              <span
                className={`text-[10px] font-semibold ${
                  invoice.status === "ISSUED" ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {invoice.status}
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-stone-400" aria-hidden="true" />
          </div>
        </Link>
      ))}
    </div>
  );
}
