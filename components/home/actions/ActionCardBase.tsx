// filepath: components/home/actions/ActionCardBase.tsx
import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionCardBaseProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  variant?: "primary" | "default";
  onClick?: () => void;
  className?: string;
  badge?: React.ReactNode;
  disabled?: boolean;
}

export function ActionCardBase({
  title,
  subtitle,
  icon,
  variant = "default",
  onClick,
  className,
  badge,
  disabled = false,
}: ActionCardBaseProps) {
  const isPrimary = variant === "primary";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className={cn(
        "group flex w-full min-h-[88px] items-center justify-between rounded-2xl p-4 sm:p-5 text-left transition-all select-none active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
        disabled
          ? "bg-stone-100/80 text-stone-400 border border-stone-200 cursor-not-allowed opacity-60"
          : isPrimary
          ? "bg-[#2563EB] text-white shadow-sm hover:bg-blue-700 active:bg-blue-800"
          : "bg-white text-[#1C1917] border border-[#E7E5E4] hover:bg-stone-50 active:bg-stone-100 shadow-xs",
        className
      )}
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform group-active:scale-95",
            isPrimary ? "bg-white/20 text-white" : "bg-stone-100 text-[#1C1917]"
          )}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3
            className={cn(
              "text-lg sm:text-xl font-bold leading-tight truncate",
              isPrimary ? "text-white" : "text-[#1C1917]"
            )}
          >
            {title}
          </h3>
          <p
            className={cn(
              "text-xs sm:text-sm mt-1 truncate",
              isPrimary ? "text-blue-100" : "text-stone-600"
            )}
          >
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-3">
        {badge}
        <ChevronRight
          className={cn(
            "h-5 w-5 shrink-0 transition-transform group-active:translate-x-0.5",
            isPrimary ? "text-white/80" : "text-[#78716C]"
          )}
        />
      </div>
    </button>
  );
}
