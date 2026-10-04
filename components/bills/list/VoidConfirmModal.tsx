// filepath: components/bills/list/VoidConfirmModal.tsx
import * as React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { type InvoiceDetail } from "@/lib/services/invoiceService";
import { formatRupees } from "@/lib/data/money";
import { useConnectivity } from "@/components/common/ConnectivityProvider";

interface VoidConfirmModalProps {
  invoice: InvoiceDetail;
  isVoiding: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function VoidConfirmModal({
  invoice,
  isVoiding,
  onConfirm,
  onCancel,
}: VoidConfirmModalProps) {
  const { isOffline } = useConnectivity();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl space-y-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 mx-auto">
          <AlertTriangle className="h-6 w-6" />
        </div>

        <div className="text-center space-y-1">
          <h3 className="text-base font-bold text-[#1C1917]">Void Invoice?</h3>
          <p className="text-xs text-[#78716C]">
            Are you sure you want to void{" "}
            <span className="font-mono font-bold text-stone-900">{invoice.invoiceNo}</span>{" "}
            for <span className="font-semibold text-stone-900">{invoice.customerName}</span>?
          </p>
        </div>

        <div className="rounded-xl bg-stone-50 p-3 text-xs space-y-1">
          <div className="flex justify-between text-stone-600">
            <span>Bill Amount:</span>
            <span className="font-bold text-stone-900">Rs {formatRupees(invoice.totalAmount)}</span>
          </div>
          <p className="text-[11px] text-red-600 mt-1">
            * This action cannot be undone. Customer balance will be recalculated.
          </p>
        </div>

        <div className="flex gap-2.5 pt-1">
          <button
            type="button"
            onClick={onCancel}
            disabled={isVoiding || isOffline}
            className="flex min-h-[46px] flex-1 items-center justify-center rounded-xl border border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isVoiding}
            className="flex min-h-[46px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-600 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
          >
            {isVoiding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span>Void Invoice</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
