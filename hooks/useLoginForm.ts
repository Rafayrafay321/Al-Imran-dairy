// filepath: hooks/useLoginForm.ts
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/actions/authActions";
import { type User } from "@/lib/data/types";

interface UseLoginFormOptions {
  onSuccess?: (user: User) => void;
}

export function useLoginForm(options?: UseLoginFormOptions) {
  const router = useRouter();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUsername = username.trim();
    if (!cleanUsername || !password) {
      setErrorMessage("Please enter both username and password.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginAction(cleanUsername, password, rememberMe);
      if (!result.success || !result.data) {
        setErrorMessage(result.error ?? "Invalid username or password.");
      } else {
        if (options?.onSuccess) {
          options.onSuccess(result.data);
        } else {
          router.push("/");
          router.refresh();
        }
      }
    } catch {
      setErrorMessage(
        "Unable to connect. Please check your connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
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
  };
}
