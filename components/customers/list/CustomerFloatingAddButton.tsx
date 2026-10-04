// filepath: components/customers/list/CustomerFloatingAddButton.tsx
import * as React from "react";
import { Plus } from "lucide-react";
import { useConnectivity } from "@/components/common/ConnectivityProvider";

interface CustomerFloatingAddButtonProps {
  onClick: () => void;
}

export function CustomerFloatingAddButton({ onClick }: CustomerFloatingAddButtonProps) {
  const { isOffline } = useConnectivity();
  return (
    <div className="fixed bottom-6 left-0 right-0 z-40 pointer-events-none pb-[env(safe-area-inset-bottom,0px)]">
      <div className="mx-auto w-full max-w-md px-4 sm:px-6 flex justify-end">
        <button
          type="button"
          onClick={onClick}
          disabled={isOffline}
          className="pointer-events-auto flex h-14 items-center gap-2 rounded-full bg-[#2563EB] px-5 text-white font-bold text-base shadow-xl hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          aria-label="Add new customer"
        >
          <Plus className="h-6 w-6 stroke-[2.5]" />
          <span>Add Customer</span>
        </button>
      </div>
    </div>
  );
}
