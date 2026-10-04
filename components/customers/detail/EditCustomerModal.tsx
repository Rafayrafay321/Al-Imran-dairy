// filepath: components/customers/detail/EditCustomerModal.tsx
"use client";

import * as React from "react";
import { X, Save, PowerOff, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  updateCustomerAction,
  toggleCustomerActiveAction,
} from "@/actions/customerActions";
import { type CustomerWithBalance } from "@/lib/services/customerService";
import { type MilkTypeRecord } from "@/lib/services/milkTypeService";
import { toFriendlyError } from "@/lib/friendlyError";

interface EditCustomerModalProps {
  customer: CustomerWithBalance;
  milkTypes: MilkTypeRecord[];
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (customer: CustomerWithBalance) => void;
}

export function EditCustomerModal({
  customer,
  milkTypes,
  isOpen,
  onClose,
  onUpdated,
}: EditCustomerModalProps) {
  const [name, setName] = React.useState(customer.name);
  const [phone, setPhone] = React.useState(customer.phone);
  const [address, setAddress] = React.useState(customer.address || "");
  const [defaultMilkTypeId, setDefaultMilkTypeId] = React.useState(customer.defaultMilkTypeId || "");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await updateCustomerAction({
        id: customer.id,
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim() || undefined,
        defaultMilkTypeId: defaultMilkTypeId || customer.defaultMilkTypeId || (milkTypes[0]?.id ?? ""),
      });

      if (!res.success || !res.data) {
        setError(res.error || "Failed to update customer.");
      } else {
        onUpdated(res.data);
        onClose();
      }
    } catch (saveError) {
      setError(toFriendlyError(saveError, "Could not save the customer. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await toggleCustomerActiveAction({
        id: customer.id,
        isActive: !customer.isActive,
      });
      if (res.success && res.data) {
        onUpdated(res.data);
        onClose();
      } else {
        setError(res.error || "Failed to update status.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-xl animate-in fade-in-50 zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E4]">
          <h3 className="font-bold text-base text-[#1C1917]">Edit Customer (Owner)</h3>
          <button type="button" onClick={onClose} aria-label="Close edit customer" className="p-2 rounded-full hover:bg-stone-100 text-stone-600 focus-visible:ring-2 focus-visible:ring-blue-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-3.5 space-y-3">
          {error && <div className="rounded-xl bg-red-50 p-2.5 text-xs text-red-800 font-semibold">{error}</div>}

          <div className="space-y-1">
            <label htmlFor="edit-customer-name" className="text-xs font-semibold text-[#1C1917]">Name</label>
            <Input id="edit-customer-name" value={name} onChange={(e) => setName(e.target.value)} required className="h-10 rounded-xl" />
          </div>

          <div className="space-y-1">
            <label htmlFor="edit-customer-phone" className="text-xs font-semibold text-[#1C1917]">Phone</label>
            <Input id="edit-customer-phone" value={phone} onChange={(e) => setPhone(e.target.value)} required className="h-10 rounded-xl font-mono" />
          </div>

          <div className="space-y-1">
            <label htmlFor="edit-customer-address" className="text-xs font-semibold text-[#1C1917]">Address</label>
            <Input id="edit-customer-address" value={address} onChange={(e) => setAddress(e.target.value)} className="h-10 rounded-xl" />
          </div>

          <div className="space-y-1">
            <label htmlFor="edit-customer-milk" className="text-xs font-semibold text-[#1C1917]">Default Milk</label>
            <select
              id="edit-customer-milk"
              value={defaultMilkTypeId}
              onChange={(e) => setDefaultMilkTypeId(e.target.value)}
              className="h-10 w-full rounded-xl border border-[#E7E5E4] px-2 text-xs font-medium"
            >
              {milkTypes.map((mt) => (
                <option key={mt.id} value={mt.id}>{mt.name}</option>
              ))}
            </select>
          </div>

          <div className="pt-2 space-y-2">
            <Button type="submit" isLoading={isSubmitting} requiresOnline className="w-full h-11 rounded-xl bg-[#2563EB] text-white">
              <span className="flex items-center gap-1.5"><Save className="h-4 w-4" /> Save Changes</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleToggleActive}
              disabled={isSubmitting}
              isLoading={isSubmitting}
              requiresOnline
              className={`w-full h-10 rounded-xl border text-xs font-semibold ${
                customer.isActive ? "text-red-600 hover:bg-red-50 border-red-200" : "text-emerald-700 hover:bg-emerald-50 border-emerald-200"
              }`}
            >
              {customer.isActive ? <span className="flex items-center gap-1"><PowerOff className="h-3.5 w-3.5" /> Deactivate Customer</span> : <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> Activate Customer</span>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
