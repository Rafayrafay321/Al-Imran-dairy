// filepath: app/reports/page.tsx
export const dynamic = "force-dynamic";
import { Suspense } from "react";
import { ReportsScreen } from "@/components/reports/ReportsScreen";
import { PageSkeleton } from "@/components/common/PageSkeleton";
import { getBalancesReportAction, getDailyDeliveriesReportAction, getMonthlySalesReportAction } from "@/actions/reportActions";
import { getShopSettingsAction } from "@/actions/masterDataActions";
import { formatIsoDate } from "@/lib/date";
import { ReportsHeader } from "@/components/reports/header/ReportsHeader";

export default function ReportsPage() {
  return <div className="min-h-screen bg-[#FAFAF9]"><ReportsHeader /><Suspense fallback={<main className="mx-auto w-full max-w-md p-4"><PageSkeleton rows={4} /></main>}><ReportsData /></Suspense></div>;
}

async function ReportsData() {
  const selectedDate = formatIsoDate(new Date());
  const selectedMonth = selectedDate.slice(0, 7);
  const [balances, monthly, daily, settings] = await Promise.all([
    getBalancesReportAction(), getMonthlySalesReportAction(selectedMonth),
    getDailyDeliveriesReportAction(selectedDate), getShopSettingsAction(),
  ]);
  const failure = [balances, monthly, daily, settings].find((result) => !result.success);
  return <ReportsScreen showHeader={false} initialData={{
    customers: balances.data ?? [], monthlySales: monthly.data ?? [],
    dailyEntries: daily.data ?? [], selectedDate, selectedMonth,
    shopSettings: settings.data ? { shopName: settings.data.shopName, phone: settings.data.phone, shopNameUrdu: settings.data.shopNameUr } : { shopName: "Al-Imran Dairy", phone: "0306-4703539" },
    error: failure?.error ?? null,
  }} />;
}
