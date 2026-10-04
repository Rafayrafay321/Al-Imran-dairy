// filepath: actions/reportActions.ts
"use server";

import { getSessionUser } from "@/lib/auth/session";
import {
  getBalancesReportFromDb,
  getTodayMetricsFromDb,
  getMonthlySalesReportFromDb,
  getDailyDeliveriesReportFromDb,
} from "@/lib/services/reportService";
import {
  type Customer,
  type TodayMetrics,
  type SalesReportCustomerRow,
  type WeeklySummaryEntry,
} from "@/lib/data/types";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Returns today's activity metrics for the home screen.
 */
export async function getTodayMetricsAction(): Promise<ActionResult<TodayMetrics>> {
  try {
    const session = await getSessionUser();
    if (!session) return { success: false, error: "Authentication required." };

    const metrics = await getTodayMetricsFromDb();
    return { success: true, data: metrics };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load metrics.";
    return { success: false, error: message };
  }
}

/**
 * Returns balances report sorted by outstanding balance descending.
 */
export async function getBalancesReportAction(): Promise<ActionResult<Customer[]>> {
  try {
    const session = await getSessionUser();
    if (!session) return { success: false, error: "Authentication required." };

    const customers = await getBalancesReportFromDb();
    return { success: true, data: customers };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load balances.";
    return { success: false, error: message };
  }
}

/**
 * Returns monthly consolidated sales summary grouped by customer.
 */
export async function getMonthlySalesReportAction(
  month?: string
): Promise<ActionResult<SalesReportCustomerRow[]>> {
  try {
    const session = await getSessionUser();
    if (!session) return { success: false, error: "Authentication required." };

    const sales = await getMonthlySalesReportFromDb(month);
    return { success: true, data: sales };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load sales report.";
    return { success: false, error: message };
  }
}

/**
 * Returns daily/weekly summary entries for a given date.
 */
export async function getDailyDeliveriesReportAction(
  date?: string
): Promise<ActionResult<WeeklySummaryEntry[]>> {
  try {
    const session = await getSessionUser();
    if (!session) return { success: false, error: "Authentication required." };

    const entries = await getDailyDeliveriesReportFromDb(date);
    return { success: true, data: entries };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load entries.";
    return { success: false, error: message };
  }
}
