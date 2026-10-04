// filepath: components/bills/create/NewBillHeader.tsx
import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ReceiptText } from "lucide-react";

export function NewBillHeader() {
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
          <h1 className="text-base font-bold text-[#1C1917]">New Weekly Bill</h1>
          <p className="text-[11px] text-[#78716C]">Consolidated weekly customer bill</p>
        </div>
      </div>
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
        <ReceiptText className="h-5 w-5" />
      </div>
    </header>
  );
}
