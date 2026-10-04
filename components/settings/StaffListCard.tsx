// filepath: components/settings/StaffListCard.tsx
"use client";

import * as React from "react";
import { UserPlus } from "lucide-react";
import { StaffListItem } from "./StaffListItem";
import { type StaffMember } from "@/lib/services/staffService";
import { useConnectivity } from "@/components/common/ConnectivityProvider";
import { EmptyState } from "@/components/common/EmptyState";

interface StaffListCardProps {
  staffList: StaffMember[];
  onOpenAddModal: () => void;
  onToggleStatus: (staffId: string, currentActive: boolean) => void;
  onOpenResetPassword: (staff: StaffMember) => void;
  processingId?: string | null;
}

export function StaffListCard({
  staffList,
  onOpenAddModal,
  onToggleStatus,
  onOpenResetPassword,
  processingId,
}: StaffListCardProps) {
  const { isOffline } = useConnectivity();
  return (
    <section className="space-y-4 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-stone-900">
            Staff Accounts ({staffList.length})
          </h2>
          <p className="mt-0.5 text-sm text-stone-600">
            Manage employee access
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenAddModal}
          disabled={isOffline}
          className="flex min-h-[44px] items-center gap-1.5 rounded-xl bg-[#2563EB] px-3.5 text-xs font-bold text-white shadow-2xs hover:bg-blue-700 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add Staff</span>
        </button>
      </div>

      {staffList.length === 0 ? (
        <EmptyState message="No staff members yet." actionLabel="Add Staff" onAction={onOpenAddModal} />
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {staffList.map((staff) => (
            <StaffListItem
              key={staff.id}
              staff={staff}
              onToggleStatus={onToggleStatus}
              onResetPassword={onOpenResetPassword}
              isProcessing={processingId === staff.id}
            />
          ))}
        </div>
      )}
    </section>
  );
}
