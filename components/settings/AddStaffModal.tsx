// filepath: components/settings/AddStaffModal.tsx
"use client";

import * as React from "react";
import { X, UserPlus, AlertCircle, Loader2 } from "lucide-react";
import { type CreateStaffInput } from "@/lib/auth/validators";
import { useConnectivity } from "@/components/common/ConnectivityProvider";
import { toFriendlyError } from "@/lib/friendlyError";

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: CreateStaffInput) => Promise<void>;
}

export function AddStaffModal({ isOpen, onClose, onAdd }: AddStaffModalProps) {
  const [name, setName] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { isOffline } = useConnectivity();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !username.trim() || !password) {
      setError("Please complete all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onAdd({
        name: name.trim(),
        username: username.trim().toLowerCase(),
        password,
      });
      setName("");
      setUsername("");
      setPassword("");
      onClose();
    } catch (err: unknown) {
      setError(toFriendlyError(err, "Could not create the staff account. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-xl animate-in fade-in-50 zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2 text-[#1C1917]">
            <UserPlus className="h-5 w-5 text-[#2563EB]" />
            <h2 className="font-bold text-base">Add New Staff</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close add staff"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-stone-500 hover:bg-stone-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label htmlFor="staff-name" className="block text-xs font-semibold text-[#1C1917] mb-1">
              Full Name
            </label>
            <input
              id="staff-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ali Raza"
              className="w-full min-h-[48px] rounded-xl border border-[#E7E5E4] px-3.5 text-sm text-[#1C1917] placeholder:text-stone-400 focus:outline-hidden focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>

          <div>
            <label htmlFor="staff-username" className="block text-xs font-semibold text-[#1C1917] mb-1">
              Username (lowercase)
            </label>
            <input
              id="staff-username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. aliraza"
              className="w-full min-h-[48px] rounded-xl border border-[#E7E5E4] px-3.5 text-sm text-[#1C1917] placeholder:text-stone-400 focus:outline-hidden focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>

          <div>
            <label htmlFor="staff-password" className="block text-xs font-semibold text-[#1C1917] mb-1">
              Initial Password
            </label>
            <input
              id="staff-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full min-h-[48px] rounded-xl border border-[#E7E5E4] px-3.5 text-sm text-[#1C1917] placeholder:text-stone-400 focus:outline-hidden focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              disabled={isSubmitting || isOffline}
              className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[#2563EB] font-bold text-sm text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />} Create Staff Account
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
