// filepath: components/customers/list/CustomersListScreen.tsx
"use client";

import * as React from "react";
import { useCustomersList } from "@/hooks/useCustomersList";
import { CustomersListHeader } from "./CustomersListHeader";
import { CustomerSearchBar } from "./CustomerSearchBar";
import { CustomerFilterChips } from "./CustomerFilterChips";
import { CustomerListItem } from "./CustomerListItem";
import { CustomerListEmptyState } from "./CustomerListEmptyState";
import { CustomerFloatingAddButton } from "./CustomerFloatingAddButton";
import { AddCustomerModal } from "./AddCustomerModal";
import { PageSkeleton } from "@/components/common/PageSkeleton";
import { type CustomerWithBalance } from "@/lib/services/customerService";

interface CustomersListScreenProps { onBack?: () => void; initialCustomers?: CustomerWithBalance[]; showHeader?: boolean; }

export function CustomersListScreen({
  onBack,
  initialCustomers,
  showHeader = true,
}: CustomersListScreenProps) {
  const {
    customers,
    totalCount,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    isAddModalOpen,
    setIsAddModalOpen,
    handleAddCustomer,
    isLoading,
  } = useCustomersList(initialCustomers);

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#FAFAF9] overflow-x-hidden">
      {/* Sticky Header */}
      {showHeader && <CustomersListHeader totalCount={totalCount} onBack={onBack} />}

      {/* Main Filter & List Container */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-4 sm:px-6 space-y-3.5 pb-28">
        {/* Search bar */}
        <CustomerSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
        />

        {/* 4 Filter Chips */}
        <CustomerFilterChips
          activeFilter={activeFilter}
          onSelectFilter={setActiveFilter}
        />

        {/* Customer List Stack */}
        <div className="space-y-2.5 pt-1">
          {isLoading ? (
            <PageSkeleton rows={3} />
          ) : customers.length === 0 ? (
            <CustomerListEmptyState query={searchQuery} onAdd={() => setIsAddModalOpen(true)} />
          ) : (
            customers.map((customer) => (
              <CustomerListItem
                key={customer.id}
                customer={customer}
              />
            ))
          )}
        </div>
      </main>

      {/* Floating Add Customer FAB */}
      <CustomerFloatingAddButton onClick={() => setIsAddModalOpen(true)} />

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddCustomer}
      />
    </div>
  );
}
