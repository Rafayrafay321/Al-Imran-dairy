// filepath: components/settings/StaffListItem.tsx
"use client";

import * as React from "react";
import { KeyRound, Loader2, Power, UserCheck, UserX } from "lucide-react";
import { type StaffMember } from "@/lib/services/staffService";
import { useConnectivity } from "@/components/common/ConnectivityProvider";

interface StaffListItemProps {
  staff: StaffMember;
  onToggleStatus: (staffId: string, currentActive: boolean) => void;
  onResetPassword: (staff: StaffMember) => void;
  isProcessing?: boolean;
}

export function StaffListItem({
  staff,
  onToggleStatus,
  onResetPassword,
  isProcessing,
}: StaffListItemProps) {
  const { isOffline } = useConnectivity();
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-stone-50/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-bold text-stone-900">
              {staff.name}
            </h3>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                staff.isActive
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-stone-100 text-stone-600 border border-stone-200"
              }`}
            >
              {staff.isActive ? (
                <>
                  <UserCheck className="h-3 w-3" />
                  Active
                </>
              ) : (
                <>
                  <UserX className="h-3 w-3" />
                  Disabled
                </>
              )}
            </span>
          </div>
          <p className="mt-1 text-sm text-stone-600">@{staff.username}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1 border-t border-stone-100">
        <button
          type="button"
          disabled={isProcessing || isOffline}
          onClick={() => onToggleStatus(staff.id, staff.isActive)}
          className={`flex-1 flex min-h-[44px] items-center justify-center gap-2 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 ${
            staff.isActive
              ? "border border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100 active:bg-amber-200"
              : "border border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 active:bg-emerald-200"
          }`}
        >
          {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Power className="h-3.5 w-3.5" />}
          <span>{staff.isActive ? "Disable" : "Enable"}</span>
        </button>

        <button
          type="button"
          disabled={isProcessing || isOffline}
          onClick={() => onResetPassword(staff)}
          className="flex-1 flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[#E7E5E4] bg-white text-xs font-semibold text-[#1C1917] hover:bg-stone-50 active:bg-stone-100 disabled:opacity-50"
        >
          <KeyRound className="h-3.5 w-3.5 text-[#78716C]" />
          <span>Reset Pass</span>
        </button>
      </div>
    </div>
  );
}
