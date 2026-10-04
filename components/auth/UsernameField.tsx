// filepath: components/auth/UsernameField.tsx
import * as React from "react";
import { Input } from "@/components/ui/input";

interface UsernameFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  hasError?: boolean;
}

export function UsernameField({
  value,
  onChange,
  disabled = false,
  hasError = false,
}: UsernameFieldProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor="username"
        className="block text-sm font-medium text-[#1C1917]"
      >
        Username
      </label>
      <Input
        id="username"
        type="text"
        autoComplete="username"
        autoCapitalize="none"
        spellCheck="false"
        placeholder="e.g. owner or staff"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        hasError={hasError}
        disabled={disabled}
        required
      />
    </div>
  );
}
