// filepath: components/auth/AuthErrorBanner.tsx
import * as React from "react";
import { AlertCircle } from "lucide-react";

interface AuthErrorBannerProps {
  message: string | null;
}

export function AuthErrorBanner({ message }: AuthErrorBannerProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-[#DC2626]"
    >
      <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
      <span className="font-medium leading-tight">{message}</span>
    </div>
  );
}
