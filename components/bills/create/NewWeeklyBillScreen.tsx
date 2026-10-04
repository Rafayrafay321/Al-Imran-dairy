// filepath: components/bills/create/NewWeeklyBillScreen.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useNewWeeklyBill } from "@/hooks/useNewWeeklyBill";
import { NewBillHeader } from "./NewBillHeader";
import { CustomerSelector } from "./CustomerSelector";
import { WeekPicker } from "./WeekPicker";
import { LineEntryCard } from "./LineEntryCard";
import { AddLineButton } from "./AddLineButton";
import { BillSummaryCard } from "./BillSummaryCard";
import { CreateBillButton } from "./CreateBillButton";
import { BillSuccessModal } from "./BillSuccessModal";
import { PageSkeleton } from "@/components/common/PageSkeleton";

interface NewWeeklyBillScreenProps {
  initialCustomerId?: string;
}

export function NewWeeklyBillScreen({ initialCustomerId }: NewWeeklyBillScreenProps) {
  const router = useRouter();
  const {
    customers,
    milkTypes,
    selectedCustomer,
    weekStart,
    weekEnd,
    lines,
    totalLiters,
    subtotal,
    previousBalance,
    grandTotal,
    isLoadingMasterData,
    isSubmitting,
    isOwner,
    canGenerate,
    error,
    createdInvoice,
    selectCustomer,
    shiftWeek,
    addLine,
    updateLine,
    removeLine,
    handleSubmit,
    resetForm,
  } = useNewWeeklyBill(initialCustomerId);

  if (isLoadingMasterData) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-md bg-stone-50 p-4"><PageSkeleton rows={4} /></main>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#FAFAF9]">
      <NewBillHeader />

      <main className="flex-1 w-full max-w-md mx-auto px-4 py-5 space-y-4 pb-24">
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-800">
            {error}
          </div>
        )}

        {/* 1. Customer Selector */}
        <CustomerSelector
          customers={customers}
          selectedCustomer={selectedCustomer}
          onSelect={selectCustomer}
        />

        {/* 2. Week Picker */}
        <WeekPicker
          weekStart={weekStart}
          weekEnd={weekEnd}
          onShiftWeek={shiftWeek}
        />

        {/* 3. Daily Entries Section */}
        {selectedCustomer && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
                Daily Deliveries ({lines.length})
              </h2>
            </div>

            <div className="space-y-2.5">
              {lines.map((line, index) => (
                <LineEntryCard
                  key={line.clientId}
                  line={line}
                  index={index}
                  weekStart={weekStart}
                  weekEnd={weekEnd}
                  milkTypes={milkTypes}
                  isOwner={isOwner}
                  onUpdate={updateLine}
                  onRemove={removeLine}
                />
              ))}
            </div>

            <AddLineButton onClick={addLine} />

            <div className="sticky bottom-0 z-10 -mx-4 space-y-3 border-t border-stone-200 bg-[#FAFAF9]/95 p-4 backdrop-blur-md">
              <BillSummaryCard
                totalLiters={totalLiters}
                subtotal={subtotal}
                previousBalance={previousBalance}
                grandTotal={grandTotal}
              />
              <CreateBillButton
                onClick={handleSubmit}
                isLoading={isSubmitting}
                disabled={!canGenerate}
              />
            </div>
          </div>
        )}
      </main>

      {/* Success Modal */}
      {createdInvoice && (
        <BillSuccessModal
          invoice={createdInvoice}
          onNewBill={resetForm}
          onViewAll={() => router.push("/bills")}
        />
      )}
    </div>
  );
}
