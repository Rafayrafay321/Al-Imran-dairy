// filepath: app/bills/page.tsx
import { Suspense } from "react";
import { BillsListScreen } from "@/components/bills/list/BillsListScreen";
import { PageSkeleton } from "@/components/common/PageSkeleton";
import { getWeeklyBillsOverviewAction } from "@/actions/invoiceActions";
import { getCalendarWeek } from "@/lib/week";
import { BillsHeader } from "@/components/bills/list/BillsHeader";

export default function BillsPage() {
  return <div className="min-h-screen bg-[#FAFAF9]">
    <BillsHeader />
    <Suspense fallback={<main className="mx-auto w-full max-w-md p-4"><PageSkeleton /></main>}>
        <BillsData />
    </Suspense>
  </div>;
}

async function BillsData() {
  const week = getCalendarWeek();
  const result = await getWeeklyBillsOverviewAction(week);
  return <BillsListScreen initialOverview={result.data} showHeader={false} />;
}
