// filepath: components/customers/detail/tabs/RatesTabList.tsx
"use client";

import * as React from "react";
import { Edit2, Check, X, ShieldAlert, Trash2 } from "lucide-react";
import { useConnectivity } from "@/components/common/ConnectivityProvider";
import { EmptyState } from "@/components/common/EmptyState";

interface MilkTypeItem {
  id: string;
  name: string;
  nameUr?: string;
  nameUrdu?: string;
  defaultRate: number;
}

interface RatesTabListProps {
  customer: {
    id: string;
    specialRates?: Record<string, number>;
  };
  milkTypes: MilkTypeItem[];
  isOwner: boolean;
  onUpdateSpecialRate: (milkTypeId: string, newRate: number) => Promise<void>;
  onDeleteSpecialRate?: (milkTypeId: string) => Promise<void>;
}

export function RatesTabList({
  customer,
  milkTypes,
  isOwner,
  onUpdateSpecialRate,
  onDeleteSpecialRate,
}: RatesTabListProps) {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draftRate, setDraftRate] = React.useState("");
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const { isOffline } = useConnectivity();

  if (milkTypes.length === 0) return <EmptyState message="No milk rates configured yet." />;

  const startEdit = (id: string, currentRate: number) => {
    setEditingId(id);
    setDraftRate(currentRate.toString());
  };

  const saveEdit = async (id: string) => {
    const val = parseFloat(draftRate);
    if (!isNaN(val) && val > 0) {
      setBusyId(id);
      setError(null);
      try {
        await onUpdateSpecialRate(id, val);
        setEditingId(null);
      } catch {
        setError("Could not save the rate. Please try again.");
      } finally { setBusyId(null); }
    }
  };

  const deleteRate = async (id: string) => {
    if (!onDeleteSpecialRate) return;
    setBusyId(id);
    setError(null);
    try { await onDeleteSpecialRate(id); }
    catch { setError("Could not reset the rate. Please try again."); }
    finally { setBusyId(null); }
  };

  return (
    <div className="space-y-3">
      {!isOwner && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-100 text-xs text-[#78716C]">
          <ShieldAlert className="h-4 w-4 shrink-0 text-[#78716C]" />
          <span>Staff account: rates are read-only.</span>
        </div>
      )}
      {error && <p className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-800">{error}</p>}

      {milkTypes.map((mt) => {
        const specialRate = customer.specialRates?.[mt.id];
        const effectiveRate = specialRate !== undefined ? specialRate : mt.defaultRate;
        const isCurrentlyEditing = editingId === mt.id;
        const urduLabel = mt.nameUr || mt.nameUrdu;

        return (
          <div
            key={mt.id}
            className="flex flex-col gap-2 rounded-2xl border border-[#E7E5E4] bg-white p-4 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-base text-[#1C1917]">
                  {mt.name} Milk {urduLabel ? `(${urduLabel})` : ""}
                </span>
                <span className="text-xs text-[#78716C] block mt-0.5">
                  Default shop rate: Rs {mt.defaultRate} / L
                </span>
              </div>

              {specialRate !== undefined ? (
                <div className="flex items-center gap-1.5">
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                    Special rate
                  </span>
                  {isOwner && onDeleteSpecialRate && (
                    <button
                      type="button"
                      onClick={() => void deleteRate(mt.id)}
                      disabled={isOffline || busyId === mt.id}
                      aria-label={`Reset ${mt.name} rate to default`}
                      className="p-2 rounded-md text-red-600 hover:bg-red-50 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-red-600"
                      title="Reset to default rate"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ) : (
                <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] text-[#78716C]">
                  Default
                </span>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#E7E5E4]">
              {isCurrentlyEditing ? (
                <div className="flex items-center gap-2 w-full">
                  <span className="text-sm font-bold text-[#1C1917]">Rs</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    aria-label={`${mt.name} custom rate`}
                    value={draftRate}
                    onChange={(e) => setDraftRate(e.target.value)}
                    className="h-10 w-24 rounded-lg border border-[#2563EB] px-2 text-base font-bold font-mono focus:outline-none"
                    autoFocus
                  />
                  <span className="text-xs text-[#78716C]">/ L</span>
                  <div className="ml-auto flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => void saveEdit(mt.id)}
                      disabled={isOffline || busyId === mt.id}
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2563EB] text-white"
                      aria-label="Save rate"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100 text-[#78716C]"
                      aria-label="Cancel"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold font-mono text-[#1C1917]">
                      Rs {effectiveRate}
                    </span>
                    <span className="text-xs text-[#78716C]">/ Liter</span>
                  </div>

                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => startEdit(mt.id, effectiveRate)}
                      disabled={isOffline}
                      className="flex h-9 items-center gap-1.5 rounded-lg border border-[#E7E5E4] px-3 text-xs font-semibold text-[#2563EB] hover:bg-blue-50 active:bg-blue-100 transition-colors"
                    >
                      <Edit2 className="h-3 w-3" />
                      <span>{specialRate !== undefined ? "Change" : "Set Custom Rate"}</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
