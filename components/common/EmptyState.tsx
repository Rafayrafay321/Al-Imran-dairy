"use client";

import Link from "next/link";
import { useConnectivity } from "./ConnectivityProvider";

interface EmptyStateProps { message: string; actionLabel?: string; actionHref?: string; onAction?: () => void; }

export function EmptyState({ message, actionLabel, actionHref, onAction }: EmptyStateProps) {
  const { isOffline } = useConnectivity();
  const actionClass = "mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-bold text-white outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2";
  return (
    <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-6 text-center">
      <p className="text-sm text-stone-700">{message}</p>
      {actionLabel && actionHref && (isOffline ? <span aria-disabled="true" className={`${actionClass} opacity-50`}>{actionLabel}</span> : <Link href={actionHref} className={actionClass}>{actionLabel}</Link>)}
      {actionLabel && onAction && <button type="button" onClick={onAction} disabled={isOffline} className={`${actionClass} disabled:opacity-50`}>{actionLabel}</button>}
    </div>
  );
}
