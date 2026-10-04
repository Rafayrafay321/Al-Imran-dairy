// filepath: hooks/useReportsData.ts
"use client";

import * as React from "react";
import {
  type Customer,
  type SalesReportCustomerRow,
  type WeeklySummaryEntry,
  type ShopSettings,
} from "@/lib/data/types";
import {
  getBalancesReportAction,
  getMonthlySalesReportAction,
  getDailyDeliveriesReportAction,
} from "@/actions/reportActions";
import { getShopSettingsAction } from "@/actions/masterDataActions";
import { toFriendlyError } from "@/lib/friendlyError";
import { formatIsoDate } from "@/lib/date";
import { normalizePakistanPhone } from "@/lib/utils/phone";

export type ReportsTabType = "balances" | "monthly" | "daily";
export type BalancesSortOrder = "balance_desc" | "name_asc";

function todayIsoDate() {
  return formatIsoDate(new Date());
}

function shiftIsoDate(date: string, offsetDays: number) {
  const value = new Date(`${date}T00:00:00`);
  value.setDate(value.getDate() + offsetDays);
  return formatIsoDate(value);
}

function shiftMonth(month: string, offset: number) {
  const [year, monthNumber] = month.split("-").map(Number);
  const value = new Date(year, monthNumber - 1 + offset, 1);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
}

export function useReportsData() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<ReportsTabType>("balances");
  const [shopSettings, setShopSettings] = React.useState<ShopSettings>({
    shopName: "Al-Imran Dairy",
    phone: "0306-4703539",
  });

  // Balances Tab State
  const [balanceSort, setBalanceSort] = React.useState<BalancesSortOrder>("balance_desc");
  const [rawCustomers, setRawCustomers] = React.useState<Customer[]>([]);

  // Monthly Sales Tab State
  const [selectedMonth, setSelectedMonth] = React.useState(() => todayIsoDate().slice(0, 7));
  const [monthlySales, setMonthlySales] = React.useState<SalesReportCustomerRow[]>([]);

  // Daily Deliveries Tab State
  const [selectedDate, setSelectedDate] = React.useState(todayIsoDate);
  const [dailyEntries, setDailyEntries] = React.useState<WeeklySummaryEntry[]>([]);

  React.useEffect(() => {
    async function loadReports() {
      setIsLoading(true);
      setError(null);
      try {
        const [balancesRes, monthlyRes, dailyRes, settingsRes] = await Promise.all([
          getBalancesReportAction(), getMonthlySalesReportAction(selectedMonth),
          getDailyDeliveriesReportAction(selectedDate), getShopSettingsAction(),
        ]);
        const failure = [balancesRes, monthlyRes, dailyRes, settingsRes].find((result) => !result.success);
        if (failure) throw new Error(failure.error);
        if (balancesRes.data) setRawCustomers(balancesRes.data);
        if (monthlyRes.data) setMonthlySales(monthlyRes.data);
        if (dailyRes.data) setDailyEntries(dailyRes.data);
        if (settingsRes.data) setShopSettings({ shopName: settingsRes.data.shopName, phone: settingsRes.data.phone, shopNameUrdu: settingsRes.data.shopNameUr });
      } catch (loadError) {
        setError(toFriendlyError(loadError, "Could not load reports. Please try again."));
      } finally { setIsLoading(false); }
    }
    loadReports();
  }, [selectedDate, selectedMonth]);

  const customersWithBalance = React.useMemo(() => {
    const list = [...rawCustomers];
    if (balanceSort === "balance_desc") {
      return list.sort((a, b) => b.previousBalance - a.previousBalance);
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [rawCustomers, balanceSort]);

  const totalOutstandingBalance = React.useMemo(() => {
    return rawCustomers.reduce((sum, c) => sum + c.previousBalance, 0);
  }, [rawCustomers]);

  const handleSendReminder = (customer: Customer) => {
    if (customer.previousBalance <= 0) return;

    const message = 
`السلام علیکم ${customer.name}،

${shopSettings.shopName} کی طرف سے یاد دہانی:
آپ کا موجودہ واجب الادا بقایا Rs ${customer.previousBalance.toLocaleString()} ہے۔
برائے مہربانی سہولت کے مطابق رقم جمع کروا دیں۔

شکریہ
${shopSettings.shopName}
فون: ${shopSettings.phone}`;

    const phone = normalizePakistanPhone(customer.phone);
    if (!phone.isValid || !phone.normalized) return;

    const whatsappUrl = `https://wa.me/${phone.normalized}?text=${encodeURIComponent(message)}`;
    if (typeof window !== "undefined") {
      window.open(whatsappUrl, "_blank");
    }
  };

  const monthlyTotalLiters = React.useMemo(() => {
    return monthlySales.reduce((sum, s) => sum + s.totalLiters, 0);
  }, [monthlySales]);

  const monthlyTotalAmount = React.useMemo(() => {
    return monthlySales.reduce((sum, s) => sum + s.totalAmount, 0);
  }, [monthlySales]);

  const dailyTotalLiters = React.useMemo(() => {
    return dailyEntries.reduce((sum, e) => sum + e.liters, 0);
  }, [dailyEntries]);

  const dailyTotalAmount = React.useMemo(() => {
    return dailyEntries.reduce((sum, e) => sum + e.amount, 0);
  }, [dailyEntries]);

  return {
    isLoading,
    error,
    activeTab,
    setActiveTab,
    // Balances
    customersWithBalance,
    totalOutstandingBalance,
    balanceSort,
    setBalanceSort,
    handleSendReminder,
    // Monthly
    selectedMonth,
    setSelectedMonth,
    shiftSelectedMonth: (offset: number) => setSelectedMonth((month) => shiftMonth(month, offset)),
    monthlySales,
    monthlyTotalLiters,
    monthlyTotalAmount,
    // Daily
    selectedDate,
    setSelectedDate,
    shiftSelectedDate: (offset: number) => setSelectedDate((date) => shiftIsoDate(date, offset)),
    dailyEntries,
    dailyTotalLiters,
    dailyTotalAmount,
  };
}
