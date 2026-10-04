// filepath: components/customers/list/CustomerListEmptyState.tsx
import * as React from "react";
import { EmptyState } from "@/components/common/EmptyState";

interface CustomerListEmptyStateProps {
  query?: string;
  onAdd: () => void;
}

export function CustomerListEmptyState({ query, onAdd }: CustomerListEmptyStateProps) {
  return <EmptyState message={query ? `No customers match “${query}”.` : "No customers in this view."} actionLabel={query ? undefined : "Add Customer"} onAction={query ? undefined : onAdd} />;
}
