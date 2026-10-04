"use client";

import * as React from "react";
import { ArrowRight, CheckCircle, Eye, Loader2, Share2 } from "lucide-react";
import { markInvoiceShared } from "@/actions/invoiceActions";
import { usePreparedInvoicePdf } from "@/hooks/usePreparedInvoicePdf";
import { formatRupees } from "@/lib/data/money";
import { shareInvoicePDF } from "@/lib/share";
import { type InvoiceDetail } from "@/lib/services/invoiceService";
import { BillPreviewModal } from "./BillPreviewModal";
import { useConnectivity } from "@/components/common/ConnectivityProvider";

interface Props { invoice: InvoiceDetail; onNewBill: () => void; onViewAll: () => void; }

export function BillSuccessModal({ invoice, onNewBill, onViewAll }: Props) {
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const [isSharing, setIsSharing] = React.useState(false);
  const [isShared, setIsShared] = React.useState(Boolean(invoice.sharedAt));
  const [note, setNote] = React.useState<string | null>(null);
  const prepared = usePreparedInvoicePdf(invoice.id, invoice.status === "ISSUED");
  const { isOffline } = useConnectivity();

  const share = async () => {
    if (!prepared.blob || invoice.status === "VOID") return;
    setIsSharing(true);
    setNote(null);
    try {
      const result = await shareInvoicePDF(prepared.blob, invoice.invoiceNo, invoice.customerName);
      if (result === "shared") {
        const marked = await markInvoiceShared(invoice.id);
        if (marked.success) setIsShared(true);
      } else setNote("Download the PDF and send it via WhatsApp.");
    } catch (shareError) {
      if ((shareError as Error).name !== "AbortError") setNote("The PDF was not shared. Please try again.");
    } finally { setIsSharing(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-sm space-y-5 rounded-3xl bg-white p-6 text-center shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><CheckCircle className="h-10 w-10" /></div>
        <div><h2 className="text-xl font-bold text-stone-900">Weekly Bill Created!</h2><p className="mt-1 font-mono text-xs font-bold text-blue-600">{invoice.invoiceNo}</p></div>
        <div className="space-y-1.5 rounded-2xl bg-stone-50 p-4 text-start text-xs">
          <p className="flex justify-between"><span>Customer</span><b>{invoice.customerName}</b></p>
          <p className="flex justify-between"><span>Week Period</span><b>{invoice.weekStart} – {invoice.weekEnd}</b></p>
          <p className="flex justify-between"><span>Total Liters</span><b>{invoice.totalLiters} L</b></p>
          <p className="flex justify-between border-t border-stone-200 pt-2"><span>Invoice Total</span><b>Rs {formatRupees(invoice.totalAmount)}</b></p>
          <p className="flex justify-between"><span>Previous Balance</span><b>Rs {formatRupees(invoice.previousBalance)}</b></p>
          <p className="flex justify-between border-t border-stone-200 pt-2 font-bold"><span>Total Payable</span><span className="text-sm text-blue-700">Rs {formatRupees(invoice.grandTotal)}</span></p>
        </div>
        <div className="space-y-2.5">
          <button type="button" onClick={() => setIsPreviewOpen(true)} className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 text-sm font-bold text-blue-700"><Eye className="h-4 w-4" /> Preview Bill</button>
          <button type="button" onClick={() => void share()} disabled={!prepared.blob || isSharing || isOffline || invoice.status === "VOID"} className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-2xl bg-green-600 text-sm font-bold text-white disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2">
            {prepared.isPreparing || isSharing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
            {prepared.isPreparing ? "Preparing PDF..." : isShared ? "Resend" : "Share PDF on WhatsApp"}
          </button>
          {isShared && <p className="text-xs font-bold text-emerald-700">Shared ✓</p>}
          {note && <p className="text-[11px] text-stone-600">{note}</p>}
          {prepared.error && <div className="space-y-2"><p className="text-[11px] text-red-700">{prepared.error}</p><button type="button" onClick={prepared.retry} className="min-h-10 rounded-xl border border-red-200 px-4 text-xs font-bold text-red-700">Retry PDF</button></div>}
          <button type="button" onClick={onNewBill} className="min-h-[46px] w-full rounded-2xl border border-stone-200 text-xs font-bold">New Bill</button>
          <button type="button" onClick={onViewAll} className="flex min-h-[46px] w-full items-center justify-center gap-1.5 rounded-2xl text-xs font-bold text-blue-700">View All Bills <ArrowRight className="h-3.5 w-3.5" /></button>
        </div>
      </div>
      {isPreviewOpen && <BillPreviewModal invoice={invoice} onClose={() => setIsPreviewOpen(false)} />}
    </div>
  );
}
