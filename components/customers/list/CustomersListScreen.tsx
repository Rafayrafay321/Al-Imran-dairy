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

interface CustomersListScreenProps {
  onBack?: () => void;
  onSelectCustomer?: (customerId: string) => void;
}

export function CustomersListScreen({
  onBack,
  onSelectCustomer,
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
  } = useCustomersList();

  const handleCustomerClick = (customerId: string) => {
    if (onSelectCustomer) {
      onSelectCustomer(customerId);
    } else if (typeof window !== "undefined") {
      window.location.href = `/customers/${customerId}`;
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#FAFAF9] overflow-x-hidden">
      {/* Sticky Header */}
      <CustomersListHeader totalCount={totalCount} onBack={onBack} />

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
                onClick={handleCustomerClick}
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
