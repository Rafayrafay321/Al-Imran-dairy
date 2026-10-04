// filepath: components/bills/list/BillsHeader.tsx
import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

export function BillsHeader() {
  return (
    <header className="sticky top-0 z-20 flex min-h-[56px] items-center justify-between border-b border-[#E7E5E4] bg-white/95 px-4 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-[#78716C] hover:bg-stone-100 active:scale-95 transition-all"
          aria-label="Back to home"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-base font-bold text-[#1C1917]">Weekly Bills</h1>
          <p className="text-[11px] text-[#78716C]">Invoices and payment reminders</p>
        </div>
      </div>
      <Link
        href="/bills/new"
        className="flex min-h-[40px] items-center gap-1 rounded-xl bg-[#2563EB] px-3.5 text-xs font-bold text-white shadow-2xs hover:bg-blue-700 active:scale-95 transition-all"
      >
        <Plus className="h-4 w-4" />
        <span>New Bill</span>
      </Link>
    </header>
  );
}
