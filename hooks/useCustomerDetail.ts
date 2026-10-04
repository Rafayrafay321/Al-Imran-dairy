// filepath: hooks/useCustomerDetail.ts
"use client";

import * as React from "react";
import {
  getCustomerByIdAction,
  upsertSpecialRateAction,
  deleteSpecialRateAction,
} from "@/actions/customerActions";
import { getMilkTypesAction } from "@/actions/masterDataActions";
import { getCurrentUserAction } from "@/actions/authActions";
import { type CustomerWithBalance } from "@/lib/services/customerService";
import { type MilkTypeRecord } from "@/lib/services/milkTypeService";
import { getInvoicesAction } from "@/actions/invoiceActions";
import { type InvoiceDetail } from "@/lib/services/invoiceService";
import {
  deletePayment as deletePaymentAction,
  getCustomerPayments,
  recordPayment as recordPaymentAction,
} from "@/actions/paymentActions";
import { type PaymentRecord } from "@/lib/services/paymentService";
import { toFriendlyError } from "@/lib/friendlyError";

export type DetailTabType = "invoices" | "payments" | "rates";

export function useCustomerDetail(customerId: string) {
  const [customer, setCustomer] = React.useState<CustomerWithBalance | null>(null);
  const [activeTab, setActiveTab] = React.useState<DetailTabType>("invoices");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isOwner, setIsOwner] = React.useState(false);
  const [invoices, setInvoices] = React.useState<InvoiceDetail[]>([]);
  const [payments, setPayments] = React.useState<PaymentRecord[]>([]);
  const [milkTypes, setMilkTypes] = React.useState<MilkTypeRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const reloadCustomer = React.useCallback(async () => {
    const res = await getCustomerByIdAction(customerId);
    if (res.success && res.data) {
      setCustomer(res.data);
    }
  }, [customerId]);

  React.useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
      const [custRes, milksRes, invsRes, paymentsRes, user] = await Promise.all([
        getCustomerByIdAction(customerId),
        getMilkTypesAction(),
        getInvoicesAction({ customerId }),
        getCustomerPayments(customerId),
        getCurrentUserAction(),
      ]);

      if (!mounted) return;
      const failure = [custRes, milksRes, invsRes, paymentsRes].find((result) => !result.success);
      if (failure) setError(toFriendlyError(failure.error, "Could not load customer details. Please try again."));

      if (custRes.success && custRes.data) {
        setCustomer(custRes.data);
      }
      if (milksRes.success && milksRes.data) {
        setMilkTypes(milksRes.data);
      }
      if (invsRes.success && invsRes.data) {
        setInvoices(invsRes.data);
      }
      if (paymentsRes.success && paymentsRes.data) {
        setPayments(paymentsRes.data);
      }
      setIsOwner(user?.role === "OWNER");
      } catch (loadError) {
        if (mounted) setError(toFriendlyError(loadError, "Could not load customer details. Please try again."));
      } finally { if (mounted) setIsLoading(false); }
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, [customerId]);

  const handleRecordPayment = async (amount: number, date: string, note?: string) => {
    if (!customer) {
      throw new Error("Customer details are not available.");
    }

    const result = await recordPaymentAction(customer.id, amount, date, note);
    if (!result.success || !result.data) {
      throw new Error(result.error || "Failed to record payment.");
    }

    const recordedPayment = result.data;
    setPayments((prev) => [recordedPayment.payment, ...prev]);
    setCustomer((prev) =>
      prev ? { ...prev, balance: recordedPayment.updatedBalance } : null
    );
    // Reload after the local update so a concurrent initial detail request cannot
    // leave Staff viewing an older balance.
    await reloadCustomer();
    return { updatedBalance: recordedPayment.updatedBalance };
  };

  const handleDeletePayment = async (paymentId: string) => {
    const result = await deletePaymentAction(paymentId);
    if (!result.success || !result.data) {
      throw new Error(result.error || "Failed to delete payment.");
    }

    setPayments((prev) => prev.filter((payment) => payment.id !== paymentId));
    setCustomer((prev) =>
      prev ? { ...prev, balance: result.data!.updatedBalance } : null
    );
  };

  const handleUpdateSpecialRate = async (milkTypeId: string, newRate: number) => {
    if (!customer || !isOwner) return;

    const res = await upsertSpecialRateAction({
      customerId: customer.id,
      milkTypeId,
      rate: newRate,
    });

    if (res.success) {
      setCustomer((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          specialRates: {
            ...(prev.specialRates || {}),
            [milkTypeId]: newRate,
          },
        };
      });
    } else throw new Error(res.error || "Could not save the rate.");
  };

  const handleDeleteSpecialRate = async (milkTypeId: string) => {
    if (!customer || !isOwner) return;

    const res = await deleteSpecialRateAction({
      customerId: customer.id,
      milkTypeId,
    });

    if (res.success) {
      setCustomer((prev) => {
        if (!prev) return null;
        const copy = { ...(prev.specialRates || {}) };
        delete copy[milkTypeId];
        return { ...prev, specialRates: copy };
      });
    } else throw new Error(res.error || "Could not reset the rate.");
  };

  const handleNewInvoiceForCustomer = () => {
    if (typeof window !== "undefined") {
      window.location.href = `/bills/new`;
    }
  };

  return {
    customer,
    activeTab,
    setActiveTab,
    invoices,
    payments,
    milkTypes,
    isLoading,
    error,
    isOwner,
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    handleRecordPayment,
    handleDeletePayment,
    handleUpdateSpecialRate,
    handleDeleteSpecialRate,
    handleNewInvoiceForCustomer,
    setCustomer,
    reloadCustomer,
  };
}
