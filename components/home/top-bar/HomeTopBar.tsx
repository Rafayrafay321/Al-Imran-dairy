// filepath: components/home/top-bar/HomeTopBar.tsx
import * as React from "react";
import { Milk } from "lucide-react";
import { ProfileMenu } from "./ProfileMenu";
import { type UserRole } from "@/lib/data/types";

interface HomeTopBarProps {
  userName: string;
  userRole: UserRole;
  onLogout: () => void;
  shopName?: string;
}

export function HomeTopBar({
  userName,
  userRole,
  onLogout,
  shopName = "Al-Imran Dairy",
}: HomeTopBarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E7E5E4] bg-white/95 backdrop-blur-xs">
      <div className="mx-auto flex w-full max-w-md items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand logo & Shop Name */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
            <Milk className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold leading-tight text-[#1C1917] truncate">
              {shopName}
            </h1>
            <p className="text-xs text-[#78716C] leading-tight truncate mt-0.5">
              Weekly Billing
            </p>
          </div>
        </div>

        {/* Profile menu with 48px touch target */}
        <div className="shrink-0 pl-2">
          <ProfileMenu
            name={userName}
            role={userRole}
            onLogout={onLogout}
          />
        </div>
      </div>
    </header>
  );
}
