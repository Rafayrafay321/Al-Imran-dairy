// filepath: components/home/top-bar/ProfileMenu.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { User, LogOut, ChevronDown, Settings } from "lucide-react";
import { RoleBadge } from "./RoleBadge";
import { type UserRole } from "@/lib/data/types";

interface ProfileMenuProps {
  name: string;
  role: UserRole;
  onLogout: () => void;
}

export function ProfileMenu({ name, role, onLogout }: ProfileMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* 48px high touch target trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex min-h-[48px] items-center gap-2 rounded-xl border border-[#E7E5E4] bg-white px-3 py-2 text-left transition-colors hover:bg-stone-50 active:bg-stone-100"
        aria-expanded={isOpen}
        aria-label="User profile menu"
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-[#1C1917]">
          <User className="h-4 w-4" />
        </div>
        <div className="hidden xs:flex flex-col min-w-0">
          <span className="text-xs font-semibold leading-tight text-[#1C1917] max-w-[80px] sm:max-w-[110px] truncate">
            {name}
          </span>
          <span className="text-[10px] text-[#78716C] leading-none mt-0.5">
            {role === "OWNER" ? "Owner" : "Staff"}
          </span>
        </div>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[#78716C]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 max-w-[calc(100vw-32px)] rounded-2xl border border-[#E7E5E4] bg-white p-3 shadow-lg z-50 animate-in fade-in-50 zoom-in-95">
          <div className="border-b border-[#E7E5E4] pb-2.5 mb-2">
            <div className="font-semibold text-sm text-[#1C1917] truncate">{name}</div>
            <div className="mt-1">
              <RoleBadge role={role} />
            </div>
          </div>

          {role === "OWNER" && (
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex min-h-[48px] w-full items-center gap-2.5 rounded-xl px-3 text-sm font-medium text-[#1C1917] transition-colors hover:bg-stone-50 active:bg-stone-100 mb-1"
            >
              <Settings className="h-4 w-4 shrink-0 text-[#78716C]" />
              <span>Shop Settings</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onLogout();
            }}
            className="flex min-h-[48px] w-full items-center gap-2.5 rounded-xl px-3 text-sm font-medium text-[#DC2626] transition-colors hover:bg-red-50 active:bg-red-100"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Log out</span>
          </button>
        </div>
      )}
    </div>
  );
}
