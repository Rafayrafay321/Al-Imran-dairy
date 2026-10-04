import { type PaymentRecord } from "@/lib/services/paymentService";
import { Loader2 } from "lucide-react";
import { useConnectivity } from "@/components/common/ConnectivityProvider";

interface DeletePaymentConfirmModalProps {
  payment: PaymentRecord;
  isDeleting: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeletePaymentConfirmModal({
  payment,
  isDeleting,
  error,
  onConfirm,
  onCancel,
}: DeletePaymentConfirmModalProps) {
  const { isOffline } = useConnectivity();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div role="alertdialog" aria-modal="true" className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl">
        <h3 className="text-lg font-bold text-stone-900">Delete this payment?</h3>
        <p className="mt-2 text-sm text-stone-600">
          Rs {payment.amount.toLocaleString()} recorded on {payment.date} will be removed and the balance recalculated.
        </p>
        {error && <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700">{error}</p>}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button type="button" onClick={onCancel} disabled={isDeleting} className="min-h-12 rounded-xl border border-stone-200 font-bold text-stone-700">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} disabled={isDeleting || isOffline} className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-red-600 font-bold text-white disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2">
            {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />} Delete Payment
          </button>
        </div>
      </div>
    </div>
  );
}
