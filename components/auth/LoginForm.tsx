// filepath: components/auth/LoginForm.tsx
"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useLoginForm } from "@/hooks/useLoginForm";
import { LoginHeader } from "@/components/auth/LoginHeader";
import { AuthErrorBanner } from "@/components/auth/AuthErrorBanner";
import { UsernameField } from "@/components/auth/UsernameField";
import { PasswordField } from "@/components/auth/PasswordField";
import { LoginSubmitButton } from "@/components/auth/LoginSubmitButton";
import { type User } from "@/lib/data/types";

interface LoginFormProps {
  onSuccess?: (user: User) => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const {
    username,
    setUsername,
    password,
    setPassword,
    showPassword,
    togglePasswordVisibility,
    rememberMe,
    setRememberMe,
    isLoading,
    errorMessage,
    handleSubmit,
  } = useLoginForm({ onSuccess });

  return (
    <Card className="w-full shadow-xs">
      <CardContent className="pt-6">
        <LoginHeader />

        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthErrorBanner message={errorMessage} />

          <UsernameField
            value={username}
            onChange={setUsername}
            disabled={isLoading}
            hasError={Boolean(errorMessage)}
          />

          <PasswordField
            value={password}
            onChange={setPassword}
            showPassword={showPassword}
            onToggleShowPassword={togglePasswordVisibility}
            disabled={isLoading}
            hasError={Boolean(errorMessage)}
          />

          <label className="flex min-h-10 cursor-pointer items-center gap-2 text-sm text-stone-700">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              disabled={isLoading}
              className="h-4 w-4 rounded border-stone-300 text-blue-600 focus:ring-2 focus:ring-blue-600"
            />
            Remember me for 30 days
          </label>

          <LoginSubmitButton isLoading={isLoading} />
        </form>
      </CardContent>
    </Card>
  );
}
