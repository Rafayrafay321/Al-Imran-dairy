"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, Share2 } from "lucide-react";
import { markInvoiceShared } from "@/actions/invoiceActions";
import { usePreparedInvoicePdf } from "@/hooks/usePreparedInvoicePdf";
import { formatRupees } from "@/lib/data/money";
import { shareInvoicePDF } from "@/lib/share";
import { type InvoiceDetail } from "@/lib/services/invoiceService";
import { useConnectivity } from "@/components/common/ConnectivityProvider";

interface GeneratedBillRowProps {
  invoice: InvoiceDetail;
}

export function GeneratedBillRow({ invoice: initialInvoice }: GeneratedBillRowProps) {
  const [invoice, setInvoice] = React.useState(initialInvoice);
  const [note, setNote] = React.useState<string | null>(null);
  const [isSharing, setIsSharing] = React.useState(false);
  const isIssued = invoice.status === "ISSUED";
  const { isOffline } = useConnectivity();
  const { blob, error, isPreparing, retry } = usePreparedInvoicePdf(invoice.id, isIssued);

  const share = async () => {
    if (!blob) return;
    setIsSharing(true);
    setNote(null);
    try {
      const result = await shareInvoicePDF(blob, invoice.invoiceNo, invoice.customerName);
      if (result === "shared") {
        const marked = await markInvoiceShared(invoice.id);
        if (marked.success) setInvoice((current) => ({ ...current, sharedAt: new Date().toISOString() }));
      } else setNote("Download the PDF and send it via WhatsApp.");
    } catch (shareError) {
      if ((shareError as Error).name !== "AbortError") setNote("The PDF was not shared. Please try again.");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
      <Link href={`/bills/${invoice.id}`} className="block transition-opacity hover:opacity-75">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0"><p className="truncate text-sm font-bold text-stone-900">{invoice.customerName}</p><p className="mt-1 font-mono text-xs text-stone-500">{invoice.invoiceNo}</p></div>
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${invoice.status === "VOID" ? "bg-red-50 text-red-700" : invoice.sharedAt ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
            {invoice.status === "VOID" ? "VOID" : invoice.sharedAt ? "Shared ✓" : "Not shared yet"}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-3 text-xs text-stone-600"><span>{invoice.totalLiters} L</span><span className="text-sm font-extrabold text-blue-700">Rs {formatRupees(invoice.grandTotal)}</span></div>
      </Link>
      {isIssued && (
        <button type="button" onClick={() => void share()} disabled={!blob || isSharing || isOffline} className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-green-600 text-xs font-bold text-white disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2">
          {isPreparing || isSharing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
          {isPreparing ? "Preparing PDF..." : invoice.sharedAt ? "Resend" : "Share PDF on WhatsApp"}
        </button>
      )}
      {note && <p className="mt-2 text-center text-[11px] text-stone-600">{note}</p>}
      {error && <div className="mt-2 text-center"><p className="text-[11px] text-red-700">{error}</p><button type="button" onClick={retry} className="mt-1 min-h-9 rounded-lg border border-red-200 px-3 text-[11px] font-bold text-red-700">Retry PDF</button></div>}
    </article>
  );
}
