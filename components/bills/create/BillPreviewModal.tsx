"use client";

import { X } from "lucide-react";
import { type InvoiceDetail } from "@/lib/services/invoiceService";
import { UrduInvoiceTemplate } from "../invoice-pdf/UrduInvoiceTemplate";

interface BillPreviewModalProps {
  invoice: InvoiceDetail;
  onClose: () => void;
}

export function BillPreviewModal({ invoice, onClose }: BillPreviewModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
      <section
        aria-labelledby="bill-preview-title"
        className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
          <div>
            <h2 id="bill-preview-title" className="text-sm font-bold text-stone-900">
              Bill Preview
            </h2>
            <p className="text-xs text-stone-500">{invoice.invoiceNo}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close bill preview"
            className="flex h-10 w-10 items-center justify-center rounded-full text-stone-600 hover:bg-stone-100"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="overflow-y-auto bg-stone-100 p-4">
          <UrduInvoiceTemplate invoice={invoice} />
        </div>
      </section>
    </div>
  );
}
