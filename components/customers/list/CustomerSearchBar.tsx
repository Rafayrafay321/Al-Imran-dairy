// filepath: components/customers/list/CustomerSearchBar.tsx
import * as React from "react";
import { Search, X } from "lucide-react";

interface CustomerSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function CustomerSearchBar({ value, onChange }: CustomerSearchBarProps) {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-[#78716C] pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search name or 03..."
        className="h-12 w-full rounded-xl border border-[#E7E5E4] bg-white pl-11 pr-10 text-base text-[#1C1917] placeholder:text-[#78716C] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-all shadow-2xs"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-0 top-0 flex h-12 w-10 items-center justify-center text-[#78716C] hover:text-[#1C1917]"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
