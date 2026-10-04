// filepath: components/customers/detail/CustomerDetailHeader.tsx
import * as React from "react";
import { ArrowLeft, Phone, Edit2 } from "lucide-react";

interface CustomerHeaderData {
  id: string;
  name: string;
  phone: string;
}

interface CustomerDetailHeaderProps {
  customer: CustomerHeaderData;
  onBack?: () => void;
  isOwner?: boolean;
  onEdit?: () => void;
}

export function CustomerDetailHeader({
  customer,
  onBack,
  isOwner,
  onEdit,
}: CustomerDetailHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E7E5E4] bg-white/95 backdrop-blur-xs">
      <div className="mx-auto flex h-16 w-full max-w-md items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack || (() => (window.location.href = "/customers"))}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-[#1C1917] hover:bg-stone-100 active:bg-stone-200 transition-colors"
            aria-label="Back to customers list"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-base font-bold leading-tight text-[#1C1917] truncate">
              {customer.name}
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-[#78716C] mt-0.5">
              <Phone className="h-3 w-3 shrink-0" />
              <span className="font-mono">{customer.phone}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isOwner && onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="flex h-8 items-center gap-1 rounded-lg border border-[#E7E5E4] px-2.5 text-xs font-semibold text-[#2563EB] hover:bg-blue-50"
            >
              <Edit2 className="h-3 w-3" />
              <span>Edit</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
