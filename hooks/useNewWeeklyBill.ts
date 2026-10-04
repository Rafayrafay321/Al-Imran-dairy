"use client";

import * as React from "react";
import { getCurrentUserAction } from "@/actions/authActions";
import { getCustomerByIdAction, getCustomersAction, type CustomerWithBalance } from "@/actions/customerActions";
import { createWeeklyInvoice } from "@/actions/invoiceActions";
import { getMilkTypesAction, type MilkTypeRecord } from "@/actions/masterDataActions";
import { calculateLineTotal } from "@/lib/data/money";
import { type UserRole } from "@/lib/data/types";
import { getCalendarWeek, shiftCalendarWeek } from "@/lib/week";
import { type InvoiceDetail } from "@/lib/services/invoiceService";

export interface LineDraft {
  clientId: string;
  entryDate: string;
  milkTypeId: string;
  liters: number;
  rate: number;
  amount: number;
  isSpecialRate: boolean;
}

export function useNewWeeklyBill(initialCustomerId?: string) {
  const [customers, setCustomers] = React.useState<CustomerWithBalance[]>([]);
  const [milkTypes, setMilkTypes] = React.useState<MilkTypeRecord[]>([]);
  const [role, setRole] = React.useState<UserRole>("STAFF");
  const [selectedCustomer, setSelectedCustomer] = React.useState<CustomerWithBalance | null>(null);
  const [{ weekStart, weekEnd }, setWeekRange] = React.useState(getCalendarWeek());
  const [lines, setLines] = React.useState<LineDraft[]>([]);
  const [isLoadingMasterData, setIsLoadingMasterData] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [createdInvoice, setCreatedInvoice] = React.useState<InvoiceDetail | null>(null);

  const rateDetails = React.useCallback((milkTypeId: string, customer: CustomerWithBalance | null) => {
    const specialRate = customer?.specialRates?.[milkTypeId];
    const defaultRate = milkTypes.find((milk) => milk.id === milkTypeId)?.defaultRate ?? 0;
    return { rate: specialRate ?? defaultRate, isSpecialRate: specialRate !== undefined };
  }, [milkTypes]);

  const makeBlankLine = React.useCallback((customer: CustomerWithBalance, entryDate: string): LineDraft => {
    const milkTypeId = customer.defaultMilkTypeId ?? milkTypes[0]?.id ?? "";
    const resolved = rateDetails(milkTypeId, customer);
    return {
      clientId: crypto.randomUUID(),
      entryDate,
      milkTypeId,
      liters: 0,
      rate: resolved.rate,
      amount: 0,
      isSpecialRate: resolved.isSpecialRate,
    };
  }, [milkTypes, rateDetails]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const [customersResult, milkResult, user] = await Promise.all([
        getCustomersAction({ filter: "ALL" }),
        getMilkTypesAction(),
        getCurrentUserAction(),
      ]);
      if (!mounted) return;
      const loadedCustomers = customersResult.data ?? [];
      const loadedMilkTypes = milkResult.data ?? [];
      setCustomers(loadedCustomers);
      setMilkTypes(loadedMilkTypes);
      setRole(user?.role ?? "STAFF");
      setIsLoadingMasterData(false);
    })();
    return () => { mounted = false; };
  }, []);

  const selectCustomer = React.useCallback(async (customerId: string) => {
    const result = await getCustomerByIdAction(customerId);
    if (!result.success || !result.data) {
      setError(result.error ?? "Could not load customer balance.");
      return;
    }
    const customer = result.data;
    setSelectedCustomer(customer);
    setCustomers((current) => current.map((item) => item.id === customer.id ? customer : item));
    setLines([makeBlankLine(customer, weekStart)]);
    setError(null);
  }, [makeBlankLine, weekStart]);

  React.useEffect(() => {
    if (!initialCustomerId || isLoadingMasterData || selectedCustomer) return;
    // The quick-create customer is loaded from the server once master data is ready.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void selectCustomer(initialCustomerId);
  }, [initialCustomerId, isLoadingMasterData, selectCustomer, selectedCustomer]);

  const shiftWeek = (offset: number) => {
    const next = shiftCalendarWeek(weekStart, offset);
    setWeekRange(next);
    setLines((current) => current.map((line) => ({ ...line, entryDate: next.weekStart })));
  };

  const addLine = () => {
    if (!selectedCustomer) return;
    const lastDate = lines.at(-1)?.entryDate ?? weekStart;
    const candidate = new Date(`${lastDate}T00:00:00`);
    candidate.setDate(candidate.getDate() + 1);
    const nextDate = candidate.toISOString().slice(0, 10);
    setLines((current) => [...current, makeBlankLine(selectedCustomer, nextDate <= weekEnd ? nextDate : weekStart)]);
  };

  const updateLine = (index: number, partial: Partial<Pick<LineDraft, "entryDate" | "milkTypeId" | "liters" | "rate">>) => {
    setLines((current) => current.map((line, lineIndex) => {
      if (lineIndex !== index) return line;
      const next = { ...line, ...partial };
      if (partial.milkTypeId && selectedCustomer) {
        const resolved = rateDetails(partial.milkTypeId, selectedCustomer);
        next.rate = resolved.rate;
        next.isSpecialRate = resolved.isSpecialRate;
      }
      next.amount = calculateLineTotal(next.liters, next.rate);
      return next;
    }));
  };

  const validLines = lines.filter((line) =>
    line.entryDate >= weekStart && line.entryDate <= weekEnd &&
    Boolean(line.milkTypeId) && line.liters > 0 && line.rate > 0
  );
  const totalLiters = validLines.reduce((sum, line) => sum + line.liters, 0);
  const subtotal = validLines.reduce((sum, line) => sum + line.amount, 0);
  const previousBalance = selectedCustomer?.balance ?? 0;

  const handleSubmit = async () => {
    if (!selectedCustomer || validLines.length !== lines.length || lines.length === 0) {
      setError("Complete at least one valid delivery entry before generating the invoice.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await createWeeklyInvoice({
        customerId: selectedCustomer.id,
        weekStart,
        weekEnd,
        lines: lines.map(({ entryDate, milkTypeId, liters, rate }) => ({ entryDate, milkTypeId, liters, rate })),
      });
      if (!result.success || !result.data) setError(result.error ?? "Failed to generate invoice.");
      else setCreatedInvoice(result.data);
    } catch {
      setError("Failed to generate invoice. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedCustomer(null);
    setLines([]);
    setCreatedInvoice(null);
    setError(null);
  };

  return {
    customers, milkTypes, selectedCustomer, weekStart, weekEnd, lines,
    totalLiters, subtotal, previousBalance, grandTotal: subtotal + previousBalance,
    isOwner: role === "OWNER", isLoadingMasterData, isSubmitting, error, createdInvoice,
    canGenerate: lines.length > 0 && validLines.length === lines.length,
    selectCustomer, shiftWeek, addLine, updateLine,
    removeLine: (index: number) => setLines((current) => current.filter((_, i) => i !== index)),
    handleSubmit, resetForm,
  };
}
