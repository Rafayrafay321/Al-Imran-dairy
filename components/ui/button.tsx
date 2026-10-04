// filepath: components/ui/button.tsx
"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useConnectivity } from "@/components/common/ConnectivityProvider";

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "whatsapp" | "destructive" | "outline" | "ghost";
  size?: "default" | "primary-lg" | "icon";
  isLoading?: boolean;
  requiresOnline?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "default",
      isLoading = false,
      requiresOnline = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const { isOffline } = useConnectivity();
    const baseStyles =
      "inline-flex items-center justify-center select-none font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none rounded-xl active:scale-[0.99] outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2";

    const variantStyles = {
      primary: "bg-[#2563EB] text-white hover:bg-blue-700 active:bg-blue-800 shadow-xs",
      whatsapp: "bg-[#16A34A] text-white hover:bg-green-700 active:bg-green-800 shadow-xs",
      destructive: "bg-[#DC2626] text-white hover:bg-red-700 active:bg-red-800 shadow-xs",
      outline:
        "border border-[#E7E5E4] bg-white text-[#1C1917] hover:bg-stone-50 active:bg-stone-100",
      ghost: "text-[#1C1917] hover:bg-stone-100 active:bg-stone-200",
    };

    const sizeStyles = {
      default: "h-12 px-4 text-base", // 48px touch target
      "primary-lg": "h-14 px-6 text-lg font-semibold", // 56px hero action target
      icon: "h-12 w-12", // 48px icon square target
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading || (requiresOnline && isOffline)}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
