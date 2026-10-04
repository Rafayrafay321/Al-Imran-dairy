"use client";

import * as React from "react";
import { ArrowDownLeft, Trash2 } from "lucide-react";
import { type PaymentRecord } from "@/lib/services/paymentService";
import { DeletePaymentConfirmModal } from "./DeletePaymentConfirmModal";
import { EmptyState } from "@/components/common/EmptyState";
import { toFriendlyError } from "@/lib/friendlyError";
import { useConnectivity } from "@/components/common/ConnectivityProvider";

interface PaymentsTabListProps {
  payments: PaymentRecord[];
  isOwner: boolean;
  onDelete: (paymentId: string) => Promise<void>;
}

export function PaymentsTabList({ payments, isOwner, onDelete }: PaymentsTabListProps) {
  const [selected, setSelected] = React.useState<PaymentRecord | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);
  const { isOffline } = useConnectivity();

  const confirmDelete = async () => {
    if (!selected) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await onDelete(selected.id);
      setSelected(null);
    } catch (error) {
      setDeleteError(toFriendlyError(error, "Could not delete the payment. Please try again."));
    } finally {
      setIsDeleting(false);
    }
  };

  if (payments.length === 0) {
    return <EmptyState message="No payments recorded yet." />;
  }

  return (
    <div className="space-y-2">
      {payments.map((payment) => (
        <div key={payment.id} className="flex items-center justify-between rounded-xl border border-[#E7E5E4] bg-white p-3.5 shadow-2xs">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <ArrowDownLeft className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span className="block text-xs font-bold text-[#1C1917]">Payment Received</span>
              <span className="block text-[11px] text-[#78716C]">
                {payment.date} · Recorded by {payment.recordedByName}
              </span>
              {payment.note && (
                <span className="mt-0.5 block truncate text-[11px] text-[#78716C]">{payment.note}</span>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 text-right">
            <span className="font-mono text-sm font-bold text-emerald-600">-Rs {payment.amount.toLocaleString()}</span>
            {isOwner && (
              <button
                type="button"
                onClick={() => setSelected(payment)}
                disabled={isOffline}
                aria-label={`Delete payment from ${payment.date}`}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      ))}

      {selected && (
        <DeletePaymentConfirmModal
          payment={selected}
          isDeleting={isDeleting}
          error={deleteError}
          onConfirm={confirmDelete}
          onCancel={() => setSelected(null)}
        />
      )}
    </div>
  );
}
