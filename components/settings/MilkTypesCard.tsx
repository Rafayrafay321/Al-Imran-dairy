// filepath: components/settings/MilkTypesCard.tsx
"use client";

import * as React from "react";
import { Milk, Plus, Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getMilkTypesAction,
  updateMilkTypeRateAction,
  toggleMilkTypeActiveAction,
} from "@/actions/masterDataActions";
import { type MilkTypeRecord } from "@/lib/services/milkTypeService";
import { AddMilkTypeModal } from "./AddMilkTypeModal";
import { useConnectivity } from "@/components/common/ConnectivityProvider";
import { PageSkeleton } from "@/components/common/PageSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { toFriendlyError } from "@/lib/friendlyError";

export function MilkTypesCard() {
  const [milkTypes, setMilkTypes] = React.useState<MilkTypeRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draftRate, setDraftRate] = React.useState("");
  const [savingId, setSavingId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const { isOffline } = useConnectivity();

  const fetchTypes = React.useCallback(async () => {
    const res = await getMilkTypesAction(true);
    if (res.success && res.data) {
      setMilkTypes(res.data);
    }
    if (!res.success) setError(toFriendlyError(res.error, "Could not load milk types. Please try again."));
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await getMilkTypesAction(true);
      if (mounted) {
        if (res.success && res.data) {
          setMilkTypes(res.data);
        }
        setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSaveRate = async (id: string) => {
    const num = parseFloat(draftRate);
    if (isNaN(num) || num <= 0) return;

    setSavingId(id);
    setError(null);
    try {
      const res = await updateMilkTypeRateAction({ id, defaultRate: num });
      if (res.success) {
        setEditingId(null);
        await fetchTypes();
      } else setError(toFriendlyError(res.error, "Could not save the rate. Please try again."));
    } finally {
      setSavingId(null);
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    setSavingId(id);
    try {
      const res = await toggleMilkTypeActiveAction({ id, isActive: !current });
      if (res.success) {
        await fetchTypes();
      }
    } finally {
      setSavingId(null);
    }
  };

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <Milk className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-stone-900">Milk Types</h2>
            <p className="mt-0.5 text-sm text-stone-600">Default rates and availability</p>
          </div>
        </div>
        <Button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="h-9 rounded-xl bg-[#2563EB] px-3 text-xs font-semibold text-white hover:bg-blue-600"
          requiresOnline
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Type
        </Button>
      </div>

      {error && <p className="mb-3 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-800">{error}</p>}
      {isLoading ? (
        <PageSkeleton rows={2} />
      ) : milkTypes.length === 0 ? (
        <EmptyState message="No milk types configured yet." actionLabel="Add Milk Type" onAction={() => setIsAddOpen(true)} />
      ) : (
        <div className="space-y-2.5">
          {milkTypes.map((mt) => {
            const isEditing = editingId === mt.id;
            const isBusy = savingId === mt.id;

            return (
              <div
                key={mt.id}
                className="flex items-center justify-between rounded-2xl border border-[#E7E5E4] p-3 bg-stone-50/50"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#1C1917]">
                      {mt.name} ({mt.nameUr})
                    </span>
                    {!mt.isActive && (
                      <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">
                        Inactive
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[#78716C] block">
                    Default rate: Rs {mt.defaultRate} / L
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        inputMode="decimal"
                        aria-label={`${mt.name} default rate`}
                        value={draftRate}
                        onChange={(e) => setDraftRate(e.target.value)}
                        className="h-8 w-18 rounded-lg border border-[#2563EB] px-2 text-xs font-bold font-mono focus:outline-none bg-white"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveRate(mt.id)}
                        disabled={isBusy || isOffline}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB] text-white"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-200 text-[#78716C]"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(mt.id);
                          setDraftRate(mt.defaultRate.toString());
                        }}
                        disabled={isOffline}
                        className="flex h-8 items-center gap-1 rounded-lg border border-[#E7E5E4] px-2.5 text-xs font-semibold text-[#2563EB] hover:bg-blue-50"
                      >
                        <Edit2 className="h-3 w-3" />
                        Edit Rate
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(mt.id, mt.isActive)}
                        disabled={isBusy || isOffline}
                        className={`h-8 rounded-lg px-2 text-[11px] font-medium transition-colors ${
                          mt.isActive
                            ? "text-red-600 hover:bg-red-50"
                            : "text-emerald-700 hover:bg-emerald-50"
                        }`}
                      >
                        {mt.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddMilkTypeModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdded={() => fetchTypes()}
      />
    </section>
  );
}
