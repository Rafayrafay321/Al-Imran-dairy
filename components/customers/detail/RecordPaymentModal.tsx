// filepath: components/customers/detail/RecordPaymentModal.tsx
"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toFriendlyError } from "@/lib/friendlyError";

interface RecordPaymentModalProps {
  customerName: string;
  currentBalance: number;
  isOpen: boolean;
  onClose: () => void;
  onRecord: (
    amount: number,
    date: string,
    note?: string
  ) => Promise<{ updatedBalance: number }>;
  onSuccess: (amount: number, updatedBalance: number) => void;
}

export function RecordPaymentModal({
  customerName,
  currentBalance,
  isOpen,
  onClose,
  onRecord,
  onSuccess,
}: RecordPaymentModalProps) {
  const [amount, setAmount] = React.useState("");
  const [note, setNote] = React.useState("");
  const [date, setDate] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!isNaN(val) && val > 0) {
      setIsSaving(true);
      setError(null);
      try {
        const result = await onRecord(val, date, note.trim() || undefined);
        setAmount("");
        setNote("");
        onClose();
        onSuccess(val, result.updatedBalance);
      } catch (paymentError) {
        setError(toFriendlyError(paymentError, "Could not record the payment. Please try again."));
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-2xs p-0 sm:p-4">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white p-5 shadow-2xl border border-[#E7E5E4]">
        <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E4]">
          <div>
            <h3 className="font-bold text-lg text-[#1C1917]">Record Payment</h3>
            <p className="text-xs text-[#78716C]">{customerName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close payment form"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-stone-600 hover:bg-stone-100 focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="rounded-xl bg-stone-50 p-3 border border-[#E7E5E4] flex justify-between items-center text-xs">
            <span className="text-[#78716C]">Current Balance due:</span>
            <span className="font-mono font-bold text-sm text-[#DC2626]">
              Rs {currentBalance.toLocaleString()}
            </span>
          </div>

          <div className="space-y-1">
            <label htmlFor="payment-amount" className="text-xs font-semibold text-[#1C1917]">
              Amount Received (Rs) *
            </label>
            <Input
              id="payment-amount"
              required
              type="number"
              inputMode="decimal"
              placeholder="e.g. 5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
              className="h-14 text-2xl font-bold"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="payment-date" className="text-xs font-semibold text-[#1C1917]">Payment Date</label>
            <Input
              id="payment-date"
              type="date"
              value={date}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="payment-note" className="text-xs font-semibold text-[#1C1917]">Optional Note</label>
            <Input
              id="payment-note"
              type="text"
              placeholder="e.g. Cash / Bank transfer / Shop hand-over"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="pt-2">
            {error && (
              <p className="mb-2 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700">
                {error}
              </p>
            )}
            <Button
              type="submit"
              variant="primary"
              size="primary-lg"
              className="w-full"
              disabled={isSaving || !amount || parseFloat(amount) <= 0}
              isLoading={isSaving}
              requiresOnline
            >
              Confirm Payment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
