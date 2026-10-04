// filepath: components/bills/create/CustomerSelector.tsx
"use client";

import * as React from "react";
import { Search, UserCheck, X } from "lucide-react";
import { type CustomerWithBalance } from "@/actions/customerActions";
import { formatRupees } from "@/lib/data/money";

interface CustomerSelectorProps {
  customers: CustomerWithBalance[];
  selectedCustomer: CustomerWithBalance | null;
  onSelect: (customerId: string) => void;
}

export function CustomerSelector({
  customers,
  selectedCustomer,
  onSelect,
}: CustomerSelectorProps) {
  const [search, setSearch] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);

  const filtered = React.useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.trim().toLowerCase();
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q)
    );
  }, [customers, search]);

  if (selectedCustomer && !isOpen) {
    return (
      <div className="rounded-2xl border border-[#E7E5E4] bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1C1917]">{selectedCustomer.name}</p>
              <p className="text-xs font-mono text-[#78716C]">{selectedCustomer.phone}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-[#78716C]">Previous Balance</p>
            <p className="text-xs font-bold text-[#DC2626]">
              Rs {formatRupees(selectedCustomer.balance)}
            </p>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="mt-1 text-[11px] font-semibold text-[#2563EB] hover:underline"
            >
              Change
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#E7E5E4] bg-white p-4 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
          Select Customer
        </label>
        {selectedCustomer && (
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-xs text-[#78716C] hover:text-[#1C1917]"
          >
            Cancel
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#78716C]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or phone (03...)"
          className="h-11 w-full rounded-xl border border-[#E7E5E4] bg-[#FAFAF9] pl-10 pr-9 text-sm text-[#1C1917] placeholder:text-[#78716C] focus:border-[#2563EB] focus:bg-white focus:outline-hidden"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716C]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="max-h-56 divide-y divide-stone-100 overflow-y-auto rounded-xl border border-stone-100">
        {filtered.length === 0 ? (
          <div className="p-4 text-center text-xs text-[#78716C]">
            No customers found matching &quot;{search}&quot;.
          </div>
        ) : (
          filtered.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                onSelect(c.id);
                setIsOpen(false);
                setSearch("");
              }}
              className="flex w-full min-h-[48px] items-center justify-between p-3 text-left hover:bg-blue-50/50 active:bg-blue-100/50 transition-colors"
            >
              <div>
                <p className="text-sm font-semibold text-[#1C1917]">{c.name}</p>
                <p className="text-xs font-mono text-[#78716C]">{c.phone}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-[#DC2626]">
                  Rs {formatRupees(c.balance)}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
