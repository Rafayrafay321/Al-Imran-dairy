// filepath: components/auth/PasswordField.tsx
import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PasswordFieldProps {
  value: string;
  onChange: (value: string) => void;
  showPassword: boolean;
  onToggleShowPassword: () => void;
  disabled?: boolean;
  hasError?: boolean;
}

export function PasswordField({
  value,
  onChange,
  showPassword,
  onToggleShowPassword,
  disabled = false,
  hasError = false,
}: PasswordFieldProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor="password"
        className="block text-sm font-medium text-[#1C1917]"
      >
        Password
      </label>
      <div className="relative">
        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          placeholder="Enter password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          hasError={hasError}
          disabled={disabled}
          className="pr-12"
          required
        />
        <button
          type="button"
          onClick={onToggleShowPassword}
          className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center text-[#78716C] hover:text-[#1C1917] focus:outline-none"
          aria-label={showPassword ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}
