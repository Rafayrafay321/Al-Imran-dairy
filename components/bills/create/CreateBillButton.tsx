// filepath: components/bills/create/CreateBillButton.tsx
import * as React from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useConnectivity } from "@/components/common/ConnectivityProvider";

interface CreateBillButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
}

export function CreateBillButton({ onClick, isLoading, disabled }: CreateBillButtonProps) {
  const { isOffline } = useConnectivity();
  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || isLoading || isOffline}
        className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-2xl bg-[#2563EB] px-6 text-base font-bold text-white shadow-md hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 transition-all outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Generating Weekly Bill...</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="h-5 w-5" />
            <span>Generate Invoice</span>
          </>
        )}
      </button>
    </div>
  );
}
