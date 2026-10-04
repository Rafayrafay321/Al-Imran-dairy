// filepath: components/settings/ResetPasswordModal.tsx
"use client";

import * as React from "react";
import { X, KeyRound, AlertCircle, Loader2 } from "lucide-react";
import { type StaffMember } from "@/lib/services/staffService";
import { useConnectivity } from "@/components/common/ConnectivityProvider";
import { toFriendlyError } from "@/lib/friendlyError";

interface ResetPasswordModalProps {
  staff: StaffMember | null;
  onClose: () => void;
  onReset: (staffId: string, newPassword: string) => Promise<void>;
}

export function ResetPasswordModal({
  staff,
  onClose,
  onReset,
}: ResetPasswordModalProps) {
  const [newPassword, setNewPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { isOffline } = useConnectivity();

  if (!staff) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onReset(staff.id, newPassword);
      setNewPassword("");
      onClose();
    } catch (err: unknown) {
      setError(toFriendlyError(err, "Could not reset the password. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-xl animate-in fade-in-50 zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2 text-[#1C1917]">
            <KeyRound className="h-5 w-5 text-amber-600" />
            <h2 className="font-bold text-base">Reset Staff Password</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close password reset"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-stone-500 hover:bg-stone-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-3 rounded-xl bg-stone-50 p-3 text-xs text-[#78716C]">
          Resetting password for:{" "}
          <strong className="text-[#1C1917]">{staff.name}</strong> (@{staff.username})
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label htmlFor="reset-password" className="block text-xs font-semibold text-[#1C1917] mb-1">
              New Password
            </label>
            <input
              id="reset-password"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full min-h-[48px] rounded-xl border border-[#E7E5E4] px-3.5 text-sm text-[#1C1917] placeholder:text-stone-400 focus:outline-hidden focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              disabled={isSubmitting || isOffline}
              className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-amber-700 font-bold text-sm text-white shadow-sm hover:bg-amber-800 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />} Update Password
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex min-h-[44px] w-full items-center justify-center rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
