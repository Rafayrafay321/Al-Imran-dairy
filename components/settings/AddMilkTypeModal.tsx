// filepath: components/settings/AddMilkTypeModal.tsx
"use client";

import * as React from "react";
import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createMilkTypeAction } from "@/actions/masterDataActions";
import { type MilkTypeRecord } from "@/lib/services/milkTypeService";
import { toFriendlyError } from "@/lib/friendlyError";

interface AddMilkTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded: (milkType: MilkTypeRecord) => void;
}

export function AddMilkTypeModal({ isOpen, onClose, onAdded }: AddMilkTypeModalProps) {
  const [name, setName] = React.useState("");
  const [nameUr, setNameUr] = React.useState("");
  const [rate, setRate] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numRate = parseFloat(rate);
    if (isNaN(numRate) || numRate <= 0) {
      setError("Please enter a valid rate greater than zero.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createMilkTypeAction({
        name: name.trim(),
        nameUr: nameUr.trim(),
        defaultRate: numRate,
      });

      if (!res.success || !res.data) {
        setError(res.error || "Failed to create milk type.");
      } else {
        onAdded(res.data);
        setName("");
        setNameUr("");
        setRate("");
        onClose();
      }
    } catch (createError) {
      setError(toFriendlyError(createError, "Could not create the milk type. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-xl animate-in fade-in-50 zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E4]">
          <h3 className="text-base font-bold text-[#1C1917]">Add New Milk Type</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close add milk type"
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-stone-100 text-[#78716C]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {error && (
            <div className="rounded-xl bg-red-50 p-2.5 text-xs font-semibold text-red-800 border border-red-200">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="milk-name" className="text-xs font-semibold text-[#1C1917]">Name (English)</label>
            <Input
              id="milk-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Camel"
              className="h-11 rounded-xl"
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="milk-name-ur" className="text-xs font-semibold text-[#1C1917]">Name (Urdu)</label>
            <Input
              id="milk-name-ur"
              value={nameUr}
              onChange={(e) => setNameUr(e.target.value)}
              placeholder="e.g. اونٹنی"
              dir="rtl"
              className="h-11 rounded-xl text-right font-medium"
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="milk-rate" className="text-xs font-semibold text-[#1C1917]">Default Rate (Rs / Liter)</label>
            <Input
              id="milk-rate"
              type="number"
              inputMode="decimal"
              step="0.5"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="e.g. 240"
              className="h-11 rounded-xl font-mono"
              required
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-11 flex-1 rounded-xl border-[#E7E5E4]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              isLoading={isSubmitting}
              requiresOnline
              className="h-11 flex-1 rounded-xl bg-[#2563EB] text-white hover:bg-blue-600"
            >
              <span className="flex items-center gap-1.5">
                  <Plus className="h-4 w-4" />
                  Add Type
              </span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
