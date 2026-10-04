// filepath: components/home/top-bar/RoleBadge.tsx
import * as React from "react";
import { USER_ROLES, type UserRole } from "@/lib/data/types";

interface RoleBadgeProps {
  role: UserRole;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const isOwner = role === USER_ROLES.OWNER;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold tracking-wide ${
        isOwner
          ? "bg-blue-50 text-[#2563EB] border border-blue-200"
          : "bg-stone-100 text-[#78716C] border border-stone-200"
      }`}
    >
      {isOwner ? "Owner" : "Staff"}
    </span>
  );
}
