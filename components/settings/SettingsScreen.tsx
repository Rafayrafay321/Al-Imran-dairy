// filepath: components/settings/SettingsScreen.tsx
"use client";

import * as React from "react";
import { SettingsHeader } from "./SettingsHeader";
import { StaffListCard } from "./StaffListCard";
import { ShopSettingsCard } from "./ShopSettingsCard";
import { MilkTypesCard } from "./MilkTypesCard";
import { AddStaffModal } from "./AddStaffModal";
import { ResetPasswordModal } from "./ResetPasswordModal";
import {
  getStaffListAction,
  createStaffAction,
  toggleStaffStatusAction,
  resetStaffPasswordAction,
} from "@/actions/staffActions";
import { type StaffMember } from "@/lib/services/staffService";
import { type CreateStaffInput } from "@/lib/auth/validators";

interface SettingsScreenProps {
  initialStaffList?: StaffMember[];
}

export function SettingsScreen({ initialStaffList = [] }: SettingsScreenProps) {
  const [staffList, setStaffList] = React.useState<StaffMember[]>(initialStaffList);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [resetTargetStaff, setResetTargetStaff] = React.useState<StaffMember | null>(null);
  const [processingId, setProcessingId] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const refreshStaff = async () => {
    const res = await getStaffListAction();
    if (res.success && res.data) {
      setStaffList(res.data);
    } else if (res.error) {
      setFeedback({ text: res.error, type: "error" });
    }
  };

  const handleAddStaff = async (data: CreateStaffInput) => {
    const res = await createStaffAction(data);
    if (!res.success) {
      throw new Error(res.error || "Failed to create staff.");
    }
    setFeedback({
      text: `Staff account @${data.username} created successfully!`,
      type: "success",
    });
    await refreshStaff();
  };

  const handleToggleStatus = async (staffId: string, currentActive: boolean) => {
    setProcessingId(staffId);
    try {
      const res = await toggleStaffStatusAction({
        staffId,
        isActive: !currentActive,
      });
      if (res.success) {
        setFeedback({
          text: `Account status updated to ${
            !currentActive ? "Active" : "Disabled"
          }.`,
          type: "success",
        });
        await refreshStaff();
      } else {
        setFeedback({
          text: res.error || "Failed to update status.",
          type: "error",
        });
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleResetPassword = async (staffId: string, newPass: string) => {
    const res = await resetStaffPasswordAction({
      staffId,
      newPassword: newPass,
    });
    if (!res.success) {
      throw new Error(res.error || "Failed to reset password.");
    }
    setFeedback({ text: "Password reset successfully.", type: "success" });
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#FAFAF9]">
      <SettingsHeader />

      <main className="mx-auto w-full max-w-lg flex-1 space-y-5 px-4 py-6 pb-12 sm:px-6">
        {feedback && (
          <div
            className={`rounded-2xl p-4 text-xs font-semibold ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {feedback.text}
          </div>
        )}

        <ShopSettingsCard />

        <MilkTypesCard />

        <StaffListCard
          staffList={staffList}
          onOpenAddModal={() => setIsAddOpen(true)}
          onToggleStatus={handleToggleStatus}
          onOpenResetPassword={(staff) => setResetTargetStaff(staff)}
          processingId={processingId}
        />
      </main>

      <AddStaffModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleAddStaff}
      />

      <ResetPasswordModal
        staff={resetTargetStaff}
        onClose={() => setResetTargetStaff(null)}
        onReset={handleResetPassword}
      />
    </div>
  );
}
