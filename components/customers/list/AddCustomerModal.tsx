// filepath: components/customers/list/AddCustomerModal.tsx
"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMilkTypesAction } from "@/actions/masterDataActions";
import { type MilkTypeRecord } from "@/lib/services/milkTypeService";
import { toFriendlyError } from "@/lib/friendlyError";

export interface NewCustomerFormData {
  name: string;
  phone: string;
  address?: string;
  defaultMilkTypeId: string;
  openingBalance: number;
}

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: NewCustomerFormData) => Promise<void>;
}

export function AddCustomerModal({ isOpen, onClose, onAdd }: AddCustomerModalProps) {
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [milkTypes, setMilkTypes] = React.useState<MilkTypeRecord[]>([]);
  const [defaultMilkTypeId, setDefaultMilkTypeId] = React.useState<string>("");
  const [openingBalance, setOpeningBalance] = React.useState("0");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      getMilkTypesAction().then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          setMilkTypes(res.data);
          setDefaultMilkTypeId((prev) => prev || res.data![0].id);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onAdd({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim() || undefined,
        defaultMilkTypeId,
        openingBalance: parseFloat(openingBalance) || 0,
      });

      setName("");
      setPhone("");
      setAddress("");
      setOpeningBalance("0");
      onClose();
    } catch (err: unknown) {
      setError(toFriendlyError(err, "Could not save the customer. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-2xs p-0 sm:p-4">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white p-5 shadow-2xl border border-[#E7E5E4] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E4]">
          <div>
            <h3 className="font-bold text-lg text-[#1C1917]">Add New Customer</h3>
            <p className="text-xs text-[#78716C]">Bulk buyer master record</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close add customer" className="flex h-10 w-10 items-center justify-center rounded-xl text-stone-600 hover:bg-stone-100 outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-4">
          {error && <div className="rounded-xl bg-red-50 p-2.5 text-xs font-semibold text-red-800 border border-red-200">{error}</div>}

          <div className="space-y-1">
            <label htmlFor="new-customer-name" className="text-xs font-semibold text-[#1C1917]">Customer Name *</label>
            <Input id="new-customer-name" required placeholder="e.g. Haji Abdul Rehman" value={name} onChange={(e) => setName(e.target.value)} className="h-11 rounded-xl" />
          </div>

          <div className="space-y-1">
            <label htmlFor="new-customer-phone" className="text-xs font-semibold text-[#1C1917]">WhatsApp Phone (0300 1234567) *</label>
            <Input id="new-customer-phone" required type="tel" placeholder="0300 1234567" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-11 rounded-xl font-mono" />
          </div>

          <div className="space-y-1">
            <label htmlFor="new-customer-address" className="text-xs font-semibold text-[#1C1917]">Shop Address (Optional)</label>
            <Input id="new-customer-address" placeholder="e.g. Main Bazar Shop #12" value={address} onChange={(e) => setAddress(e.target.value)} className="h-11 rounded-xl" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="new-customer-milk" className="text-xs font-semibold text-[#1C1917]">Default Milk</label>
              <select id="new-customer-milk" value={defaultMilkTypeId} onChange={(e) => setDefaultMilkTypeId(e.target.value)} className="h-11 w-full rounded-xl border border-[#E7E5E4] bg-white px-3 text-xs font-medium text-[#1C1917]">
                {milkTypes.map((mt) => (
                  <option key={mt.id} value={mt.id}>{mt.name} ({mt.nameUr})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="new-customer-balance" className="text-xs font-semibold text-[#1C1917]">Opening Balance (Rs)</label>
              <Input id="new-customer-balance" type="number" inputMode="decimal" value={openingBalance} onChange={(e) => setOpeningBalance(e.target.value)} className="h-11 rounded-xl font-mono" />
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" isLoading={isSubmitting} requiresOnline className="w-full h-12 rounded-xl bg-[#2563EB] text-sm font-semibold text-white hover:bg-blue-600">
              Save Customer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
