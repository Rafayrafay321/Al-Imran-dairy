// filepath: hooks/useCustomersList.ts
"use client";

import * as React from "react";
import {
  getCustomersAction,
  createCustomerAction,
} from "@/actions/customerActions";
import {
  type CustomerWithBalance,
  type CustomerFilterChip,
} from "@/lib/services/customerService";
import { type NewCustomerFormData } from "@/components/customers/list/AddCustomerModal";

export type CustomerFilterType = "ALL" | "HAS_BALANCE" | "INACTIVE";

export function useCustomersList(initialCustomers: CustomerWithBalance[] = []) {
  const [customers, setCustomers] = React.useState<CustomerWithBalance[]>(initialCustomers);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeFilter, setActiveFilter] = React.useState<CustomerFilterType>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const initialRender = React.useRef(true);

  const fetchCustomers = React.useCallback(async (query: string, filter: CustomerFilterType) => {
    setIsLoading(true);
    try {
      const res = await getCustomersAction({
        search: query.trim() || undefined,
        filter: filter as CustomerFilterChip,
      });
      if (res.success && res.data) {
        setCustomers(res.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      fetchCustomers(searchQuery, activeFilter);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, activeFilter, fetchCustomers]);

  const handleAddCustomer = async (data: NewCustomerFormData) => {
    if (!data.defaultMilkTypeId) {
      throw new Error("Please select a default milk type.");
    }

    const res = await createCustomerAction({
      name: data.name,
      phone: data.phone,
      address: data.address,
      defaultMilkTypeId: data.defaultMilkTypeId,
      openingBalance: data.openingBalance,
    });

    if (!res.success || !res.data) {
      throw new Error(res.error || "Failed to add customer.");
    }

    // Refresh customers list
    await fetchCustomers(searchQuery, activeFilter);
  };

  return {
    customers,
    totalCount: customers.length,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    isAddModalOpen,
    setIsAddModalOpen,
    handleAddCustomer,
    isLoading,
  };
}
