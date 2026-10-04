// filepath: components/auth/LoginSubmitButton.tsx
import * as React from "react";
import { Button } from "@/components/ui/button";

interface LoginSubmitButtonProps {
  isLoading: boolean;
}

export function LoginSubmitButton({ isLoading }: LoginSubmitButtonProps) {
  return (
    <div className="pt-2">
      <Button
        type="submit"
        variant="primary"
        size="primary-lg"
        className="w-full"
        isLoading={isLoading}
        requiresOnline
      >
        Log In
      </Button>
    </div>
  );
}
