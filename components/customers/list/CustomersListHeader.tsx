// filepath: components/customers/list/CustomersListHeader.tsx
import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface CustomersListHeaderProps {
  totalCount?: number;
  onBack?: () => void;
}

export function CustomersListHeader({ totalCount, onBack }: CustomersListHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E7E5E4] bg-white/95 backdrop-blur-xs">
      <div className="mx-auto flex h-16 w-full max-w-md items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {onBack ? <button
            type="button"
            onClick={onBack}
            className="flex h-12 w-12 items-center justify-center rounded-xl text-[#1C1917] hover:bg-stone-100 active:bg-stone-200 transition-colors"
            aria-label="Go back to home"
          >
            <ArrowLeft className="h-5 w-5" />
          </button> : <Link href="/" className="flex h-12 w-12 items-center justify-center rounded-xl text-[#1C1917] hover:bg-stone-100 active:bg-stone-200 transition-colors" aria-label="Go back to home"><ArrowLeft className="h-5 w-5" /></Link>}
          <div>
            <h1 className="text-lg font-bold leading-tight text-[#1C1917]">
              Customers
            </h1>
            <p className="text-xs text-[#78716C] leading-none mt-0.5">
              Profiles and balances
            </p>
          </div>
        </div>

        {typeof totalCount === "number" && <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 text-[#1C1917] border border-[#E7E5E4]">{totalCount} total</span>}
      </div>
    </header>
  );
}
