"use client";

import * as React from "react";
import { getWeeklyBillsOverviewAction } from "@/actions/invoiceActions";
import { type WeeklyBillsOverview } from "@/lib/services/invoiceService";
import { getCalendarWeek, shiftCalendarWeek } from "@/lib/week";

const EMPTY_OVERVIEW: WeeklyBillsOverview = { generated: [], notBilled: [] };

export function useBillsList(initialOverview: WeeklyBillsOverview = EMPTY_OVERVIEW) {
  const [{ weekStart, weekEnd }, setWeek] = React.useState(getCalendarWeek());
  const [overview, setOverview] = React.useState(initialOverview);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const initialRender = React.useRef(true);

  const load = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const result = await getWeeklyBillsOverviewAction({ weekStart, weekEnd });
    if (result.success && result.data) setOverview(result.data);
    else setError(result.error ?? "Could not load bills for this week.");
    setIsLoading(false);
  }, [weekEnd, weekStart]);

  // This effect intentionally starts the server-backed load for the selected week.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  React.useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    void load();
  }, [load]);

  const shiftWeek = (offset: number) => setWeek(shiftCalendarWeek(weekStart, offset));

  return { ...overview, weekStart, weekEnd, isLoading, error, shiftWeek, retry: load };
}
