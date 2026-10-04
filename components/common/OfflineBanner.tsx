"use client";

import { WifiOff } from "lucide-react";
import { useConnectivity } from "./ConnectivityProvider";

export function OfflineBanner() {
  const { isOffline } = useConnectivity();
  if (!isOffline) return null;

  return (
    <div role="status" aria-live="polite" className="sticky top-0 z-[100] flex w-full items-center justify-center gap-2 bg-amber-500 px-4 py-3 text-center text-sm font-semibold text-stone-950 shadow-sm">
      <WifiOff aria-hidden="true" className="h-4 w-4 shrink-0" />
      <span>No internet. Please wait until it is back.</span>
    </div>
  );
}
