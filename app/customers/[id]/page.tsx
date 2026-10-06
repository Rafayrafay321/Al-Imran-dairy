// filepath: app/customers/[id]/page.tsx
import { Suspense } from "react";
import { CustomerDetailScreen } from "@/components/customers/detail/CustomerDetailScreen";
import { PageSkeleton } from "@/components/common/PageSkeleton";
import { getCustomerByIdAction } from "@/actions/customerActions";
import { getMilkTypesAction } from "@/actions/masterDataActions";
import { getInvoicesAction } from "@/actions/invoiceActions";
import { getCustomerPayments } from "@/actions/paymentActions";
import { getCurrentUserAction } from "@/actions/authActions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <div className="min-h-screen bg-[#FAFAF9]"><header className="sticky top-0 z-40 border-b border-stone-200 bg-white"><div className="mx-auto flex h-16 max-w-md items-center gap-3 px-4"><Link href="/customers" aria-label="Back to customers" className="flex h-11 w-11 items-center justify-center rounded-xl focus-visible:ring-2 focus-visible:ring-blue-600"><ArrowLeft className="h-5 w-5" /></Link><h1 className="font-bold text-stone-900">Customer details</h1></div></header><Suspense fallback={<main className="mx-auto w-full max-w-md p-4"><PageSkeleton rows={4} /></main>}><CustomerDetailData customerId={id} /></Suspense></div>;
}

async function CustomerDetailData({ customerId }: { customerId: string }) {
  const [customer, milkTypes, invoices, payments, user] = await Promise.all([
    getCustomerByIdAction(customerId), getMilkTypesAction(),
    getInvoicesAction({ customerId }), getCustomerPayments(customerId), getCurrentUserAction(),
  ]);
  const failure = [customer, milkTypes, invoices, payments].find((result) => !result.success);
  return <CustomerDetailScreen customerId={customerId} showHeader={false} initialData={{
    customer: customer.data ?? null,
    milkTypes: milkTypes.data ?? [],
    invoices: invoices.data ?? [],
    payments: payments.data ?? [],
    isOwner: user?.role === "OWNER",
    error: failure?.error ?? null,
  }} />;
}
