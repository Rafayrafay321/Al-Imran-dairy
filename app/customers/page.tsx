// filepath: app/customers/page.tsx
import { Suspense } from "react";
import { CustomersListScreen } from "@/components/customers/list/CustomersListScreen";
import { PageSkeleton } from "@/components/common/PageSkeleton";
import { getCustomersAction } from "@/actions/customerActions";
import { CustomersListHeader } from "@/components/customers/list/CustomersListHeader";

export default function CustomersPage() {
  return <div className="min-h-screen bg-[#FAFAF9]"><CustomersListHeader /><Suspense fallback={<main className="mx-auto w-full max-w-md p-4"><PageSkeleton rows={4} /></main>}><CustomersData /></Suspense></div>;
}

async function CustomersData() {
  const result = await getCustomersAction();
  return <CustomersListScreen initialCustomers={result.data} showHeader={false} />;
}
