// filepath: components/customers/detail/CustomerDetailScreen.tsx
"use client";

import * as React from "react";
import { useCustomerDetail } from "@/hooks/useCustomerDetail";
import { CustomerDetailHeader } from "./CustomerDetailHeader";
import { CustomerBalanceHero } from "./CustomerBalanceHero";
import { CustomerActionRow } from "./CustomerActionRow";
import { DetailTabsNav } from "./tabs/DetailTabsNav";
import { InvoicesTabList } from "./tabs/InvoicesTabList";
import { PaymentsTabList } from "./tabs/PaymentsTabList";
import { RatesTabList } from "./tabs/RatesTabList";
import { RecordPaymentModal } from "./RecordPaymentModal";
import { PaymentSuccessModal } from "./PaymentSuccessModal";
import { EditCustomerModal } from "./EditCustomerModal";
import { PageSkeleton } from "@/components/common/PageSkeleton";

interface CustomerDetailScreenProps {
  customerId: string;
  onBack?: () => void;
}

export function CustomerDetailScreen({
  customerId,
  onBack,
}: CustomerDetailScreenProps) {
  const [paymentSuccess, setPaymentSuccess] = React.useState<{
    amount: number;
    updatedBalance: number;
  } | null>(null);
  const {
    customer,
    activeTab,
    setActiveTab,
    invoices,
    payments,
    milkTypes,
    isLoading,
    error,
    isOwner,
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    handleRecordPayment,
    handleDeletePayment,
    handleUpdateSpecialRate,
    handleDeleteSpecialRate,
    handleNewInvoiceForCustomer,
    setCustomer,
  } = useCustomerDetail(customerId);

  if (isLoading) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-md p-4"><PageSkeleton rows={4} /></main>
    );
  }
  if (!customer) return <main className="mx-auto max-w-md p-4"><p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error ?? "Customer details could not be loaded."}</p></main>;

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#FAFAF9] overflow-x-hidden">
      {/* Top Header with Owner Edit Button */}
      <CustomerDetailHeader
        customer={customer}
        onBack={onBack}
        isOwner={isOwner}
        onEdit={() => setIsEditModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-5 sm:px-6 space-y-4 pb-12">
        {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        {/* Large Balance Hero Number (COMPUTED LIVE BALANCE) */}
        <CustomerBalanceHero balance={customer.balance} />

        {/* Action Buttons: New Bill & Record Payment */}
        <CustomerActionRow
          onNewBill={handleNewInvoiceForCustomer}
          onRecordPayment={() => setIsPaymentModalOpen(true)}
        />

        {/* Tabs: Invoices, Payments, Rates */}
        <DetailTabsNav
          activeTab={activeTab}
          onChangeTab={setActiveTab}
        />

        {/* Tab Content List */}
        <div className="pt-1">
          {activeTab === "invoices" && (
            <InvoicesTabList invoices={invoices} />
          )}

          {activeTab === "payments" && (
            <PaymentsTabList
              payments={payments}
              isOwner={isOwner}
              onDelete={handleDeletePayment}
            />
          )}

          {activeTab === "rates" && (
            <RatesTabList
              customer={customer}
              milkTypes={milkTypes}
              isOwner={isOwner}
              onUpdateSpecialRate={handleUpdateSpecialRate}
              onDeleteSpecialRate={handleDeleteSpecialRate}
            />
          )}
        </div>
      </main>

      {/* Record Payment Modal */}
      <RecordPaymentModal
        customerName={customer.name}
        currentBalance={customer.balance}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onRecord={handleRecordPayment}
        onSuccess={(amount, updatedBalance) =>
          setPaymentSuccess({ amount, updatedBalance })
        }
      />

      {paymentSuccess && (
        <PaymentSuccessModal
          customerName={customer.name}
          amount={paymentSuccess.amount}
          updatedBalance={paymentSuccess.updatedBalance}
          onClose={() => setPaymentSuccess(null)}
        />
      )}

      {/* Edit Customer Modal (Owner only) */}
      {isOwner && (
        <EditCustomerModal
          customer={customer}
          milkTypes={milkTypes}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdated={(updated) => setCustomer(updated)}
        />
      )}
    </div>
  );
}
