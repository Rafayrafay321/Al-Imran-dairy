// filepath: components/ui/input.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", hasError = false, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-12 w-full rounded-xl bg-white px-4 text-base text-[#1C1917] placeholder:text-[#78716C] transition-colors border",
          "focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]",
          "disabled:cursor-not-allowed disabled:bg-stone-100 disabled:opacity-60",
          hasError ? "border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/20" : "border-[#E7E5E4]",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
