"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Share2 } from "lucide-react";
import { getCurrentUserAction } from "@/actions/authActions";
import { getInvoiceByIdAction, markInvoiceShared, voidInvoice } from "@/actions/invoiceActions";
import { VoidConfirmModal } from "@/components/bills/list/VoidConfirmModal";
import { usePreparedInvoicePdf } from "@/hooks/usePreparedInvoicePdf";
import { formatRupees } from "@/lib/data/money";
import { shareInvoicePDF } from "@/lib/share";
import { type InvoiceDetail } from "@/lib/services/invoiceService";
import { formatWeekLabel } from "@/lib/week";
import { useConnectivity } from "@/components/common/ConnectivityProvider";
import { PageSkeleton } from "@/components/common/PageSkeleton";

export function InvoiceDetailScreen({ invoiceId }: { invoiceId: string }) {
  const [invoice, setInvoice] = React.useState<InvoiceDetail | null>(null);
  const [isOwner, setIsOwner] = React.useState(false);
  const [isSharing, setIsSharing] = React.useState(false);
  const [showVoid, setShowVoid] = React.useState(false);
  const [isVoiding, setIsVoiding] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const isIssued = invoice?.status === "ISSUED";
  const prepared = usePreparedInvoicePdf(invoiceId, isIssued);
  const { isOffline } = useConnectivity();

  React.useEffect(() => {
    void Promise.all([getInvoiceByIdAction(invoiceId), getCurrentUserAction()]).then(([result, user]) => {
      if (result.success && result.data) setInvoice(result.data); else setError(result.error ?? "Invoice not found.");
      setIsOwner(user?.role === "OWNER");
    });
  }, [invoiceId]);

  const share = async () => {
    if (!invoice || !prepared.blob || !isIssued) return;
    setIsSharing(true); setError(null);
    try {
      const outcome = await shareInvoicePDF(prepared.blob, invoice.invoiceNo, invoice.customerName);
      if (outcome === "shared") {
        const marked = await markInvoiceShared(invoice.id);
        if (marked.success) setInvoice((value) => value ? { ...value, sharedAt: new Date().toISOString() } : null);
      } else setError("Download the PDF and send it via WhatsApp.");
    } catch (shareError) {
      if ((shareError as Error).name !== "AbortError") setError("The PDF was not shared. Please try again.");
    } finally { setIsSharing(false); }
  };

  const confirmVoid = async () => {
    if (!invoice) return;
    setIsVoiding(true);
    const result = await voidInvoice(invoice.id);
    setIsVoiding(false);
    if (result.success && result.data) { setInvoice(result.data); setShowVoid(false); }
    else setError(result.error ?? "Could not void invoice.");
  };

  if (error && !invoice) return <main className="p-6 text-center text-sm text-red-700">{error}</main>;
  if (!invoice) return <main className="mx-auto min-h-screen w-full max-w-md p-4"><PageSkeleton rows={4} /></main>;

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="flex min-h-14 items-center gap-3 border-b border-stone-200 bg-white px-4"><Link href="/bills" aria-label="Back to bills" className="flex h-10 w-10 items-center justify-center rounded-xl"><ArrowLeft className="h-5 w-5" /></Link><div><h1 className="font-bold">Invoice Detail</h1><p className="font-mono text-xs text-stone-500">{invoice.invoiceNo}</p></div></header>
      <main className="mx-auto w-full max-w-md space-y-4 p-4">
        {error && <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">{error}</p>}
        <section className="space-y-3 rounded-2xl border border-stone-200 bg-white p-4">
          <p className="flex justify-between"><span>Customer</span><b>{invoice.customerName}</b></p><p className="flex justify-between"><span>Week</span><b>{formatWeekLabel(invoice)}</b></p><p className="flex justify-between"><span>Invoice total</span><b>Rs {formatRupees(invoice.totalAmount)}</b></p><p className="flex justify-between"><span>Previous balance</span><b>Rs {formatRupees(invoice.previousBalance)}</b></p><p className="flex justify-between border-t pt-3"><b>Total payable</b><b className="text-lg text-blue-700">Rs {formatRupees(invoice.grandTotal)}</b></p>
          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${invoice.status === "VOID" ? "bg-red-50 text-red-700" : invoice.sharedAt ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{invoice.status === "VOID" ? "VOID" : invoice.sharedAt ? "Shared ✓" : "Not shared yet"}</span>
        </section>
        {isIssued && <button type="button" onClick={() => void share()} disabled={!prepared.blob || isSharing || isOffline} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-green-600 font-bold text-white disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2">{prepared.isPreparing || isSharing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Share2 className="h-5 w-5" />}{prepared.isPreparing ? "Preparing PDF..." : "Resend"}</button>}
        {prepared.error && <div className="space-y-2 text-center"><p className="text-xs text-red-700">{prepared.error}</p><button type="button" onClick={prepared.retry} className="min-h-10 rounded-xl border border-red-200 px-4 text-xs font-bold text-red-700">Retry PDF</button></div>}
        {isOwner && isIssued && <button type="button" onClick={() => setShowVoid(true)} disabled={isOffline} className="min-h-12 w-full rounded-2xl border border-red-200 font-bold text-red-700 disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2">Void Invoice</button>}
      </main>
      {showVoid && <VoidConfirmModal invoice={invoice} isVoiding={isVoiding} onConfirm={() => void confirmVoid()} onCancel={() => setShowVoid(false)} />}
    </div>
  );
}
