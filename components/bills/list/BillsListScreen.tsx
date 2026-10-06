"use client";

import * as React from "react";
import { useBillsList } from "@/hooks/useBillsList";
import { WeekPicker } from "@/components/bills/create/WeekPicker";
import { BillsHeader } from "./BillsHeader";
import { GeneratedBillRow } from "./GeneratedBillRow";
import { NotBilledCustomerRow } from "./NotBilledCustomerRow";
import { PageSkeleton } from "@/components/common/PageSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { type WeeklyBillsOverview } from "@/lib/services/invoiceService";

export function BillsListScreen({ initialOverview, showHeader = true }: { initialOverview?: WeeklyBillsOverview; showHeader?: boolean }) {
  const { generated, notBilled, weekStart, weekEnd, isLoading, error, shiftWeek, retry } = useBillsList(initialOverview);
  const [onlyUnshared, setOnlyUnshared] = React.useState(false);
  const visibleGenerated = onlyUnshared
    ? generated.filter((invoice) => invoice.status === "ISSUED" && !invoice.sharedAt)
    : generated;

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {showHeader && <BillsHeader />}
      <main className="mx-auto w-full max-w-md space-y-5 px-4 py-5 pb-20">
        <WeekPicker weekStart={weekStart} weekEnd={weekEnd} onShiftWeek={shiftWeek} />

        {isLoading ? (
          <PageSkeleton rows={4} />
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <p>{error}</p>
            <button type="button" onClick={() => void retry()} className="mt-3 min-h-11 rounded-xl bg-red-600 px-4 font-bold text-white">Try Again</button>
          </div>
        ) : (
          <>
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-bold text-stone-900">Bills Generated ({visibleGenerated.length})</h2>
                <button type="button" aria-pressed={onlyUnshared} onClick={() => setOnlyUnshared((value) => !value)} className={`min-h-9 rounded-full border px-3 text-[11px] font-bold ${onlyUnshared ? "border-amber-400 bg-amber-50 text-amber-800" : "border-stone-200 bg-white text-stone-600"}`}>Not shared yet</button>
              </div>
              {visibleGenerated.length === 0 ? <EmptyState message={onlyUnshared ? "No unshared bills this week." : "No bills generated this week."} actionLabel={onlyUnshared ? undefined : "Create First Bill"} actionHref={onlyUnshared ? undefined : "/bills/new"} /> : visibleGenerated.map((invoice) => <GeneratedBillRow key={invoice.id} invoice={invoice} />)}
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-bold text-stone-900">Not Billed Yet ({notBilled.length})</h2>
              {notBilled.length === 0 ? <EmptyState message="Every active customer has a bill for this week." /> : notBilled.map((customer) => <NotBilledCustomerRow key={customer.id} customer={customer} />)}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
