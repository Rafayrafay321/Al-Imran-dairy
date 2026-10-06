"use client";

import * as React from "react";

export function AppScreenLoader({ show = true }: { show?: boolean }) {
  if (!show) return null;
  return (
    <div role="status" aria-live="polite" aria-label="Loading Al-Imran Dairy" className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center bg-[#FAFAF9]">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-extrabold text-white shadow-lg">A</div>
        <div className="flex items-center gap-2 text-sm font-semibold text-stone-700"><span className="h-4 w-4 animate-spin rounded-full border-2 border-stone-300 border-t-blue-600" aria-hidden="true" />Loading Al-Imran Dairy...</div>
      </div>
    </div>
  );
}

export function StartupScreenLoader() {
  const [visible, setVisible] = React.useState(true);
  React.useEffect(() => {
    let hideTimer = window.setTimeout(() => setVisible(false), 450);
    let hiddenAt: number | null = null;
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") { hiddenAt = Date.now(); return; }
      if (hiddenAt !== null && Date.now() - hiddenAt >= 10_000) {
        setVisible(true);
        window.clearTimeout(hideTimer);
        hideTimer = window.setTimeout(() => setVisible(false), 700);
      }
      hiddenAt = null;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => { window.clearTimeout(hideTimer); document.removeEventListener("visibilitychange", handleVisibilityChange); };
  }, []);
  return <AppScreenLoader show={visible} />;
}
