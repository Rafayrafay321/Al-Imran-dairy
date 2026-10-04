"use client";

import { CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRupees } from "@/lib/data/money";

interface PaymentSuccessModalProps {
  customerName: string;
  amount: number;
  updatedBalance: number;
  onClose: () => void;
}

export function PaymentSuccessModal({
  customerName,
  amount,
  updatedBalance,
  onClose,
}: PaymentSuccessModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-2xs">
      <section
        aria-labelledby="payment-success-title"
        aria-modal="true"
        role="dialog"
        className="w-full max-w-sm rounded-3xl border border-stone-200 bg-white p-6 text-center shadow-2xl"
      >
        <div className="flex justify-end">
          <button
            type="button"
            aria-label="Close payment success message"
            onClick={onClose}
            className="-mt-2 -me-2 flex h-10 w-10 items-center justify-center rounded-xl text-stone-600 hover:bg-stone-100 focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <CheckCircle2 className="mx-auto -mt-2 h-16 w-16 text-emerald-600" aria-hidden="true" />
        <h2 id="payment-success-title" className="mt-4 text-xl font-bold text-stone-900">
          Payment received successfully
        </h2>
        <p className="mt-1 text-sm text-stone-600">Payment recorded for {customerName}.</p>

        <div className="mt-5 space-y-3 rounded-2xl bg-emerald-50 p-4 text-start">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-stone-600">Amount received</span>
            <strong className="text-emerald-700">Rs {formatRupees(amount)}</strong>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-emerald-100 pt-3 text-sm">
            <span className="text-stone-600">Updated balance</span>
            <strong className={updatedBalance > 0 ? "text-red-700" : "text-emerald-700"}>
              Rs {formatRupees(updatedBalance)}
            </strong>
          </div>
        </div>

        <Button type="button" variant="primary" size="primary-lg" className="mt-6 w-full" onClick={onClose}>
          Done
        </Button>
      </section>
    </div>
  );
}
