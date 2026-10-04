// filepath: components/bills/create/AddLineButton.tsx
import * as React from "react";
import { PlusCircle } from "lucide-react";

interface AddLineButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function AddLineButton({ onClick, disabled }: AddLineButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#E7E5E4] bg-white py-3 text-xs font-bold text-[#2563EB] shadow-2xs hover:border-[#2563EB] hover:bg-blue-50/40 active:scale-[0.99] disabled:opacity-50 transition-all"
    >
      <PlusCircle className="h-4 w-4" />
      <span>+ Add Day Entry</span>
    </button>
  );
}
