// filepath: components/settings/SettingsHeader.tsx
"use client";

import * as React from "react";
import { ArrowLeft, Settings } from "lucide-react";

interface SettingsHeaderProps {
  onBack: () => void;
}

export function SettingsHeader({ onBack }: SettingsHeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-[#E7E5E4] bg-white/95 backdrop-blur-xs">
      <div className="mx-auto flex w-full max-w-lg items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-900 transition-colors hover:bg-stone-50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            aria-label="Back to home"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-stone-900 leading-tight">
              Settings
            </h1>
            <p className="mt-1 text-xs font-medium text-stone-600 leading-none">
              Shop and account management
            </p>
          </div>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
          <Settings className="h-5 w-5" />
        </div>
      </div>
    </header>
  );
}
