"use client";

import * as React from "react";

export function usePreparedInvoicePdf(invoiceId: string, enabled = true) {
  const [blob, setBlob] = React.useState<Blob | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [attempt, setAttempt] = React.useState(0);

  React.useEffect(() => {
    if (!enabled) return;
    let active = true;
    void import("@/lib/pdfGenerator").then(({ generateInvoicePDF }) => generateInvoicePDF(invoiceId)).then(
      (prepared) => { if (active) setBlob(prepared); },
      (preparationError) => {
        console.error("Invoice PDF preparation failed", preparationError);
        if (active) setError("Could not prepare the PDF. Please retry.");
      }
    );
    return () => { active = false; };
  }, [attempt, enabled, invoiceId]);

  const retry = () => {
    setBlob(null);
    setError(null);
    setAttempt((value) => value + 1);
  };

  return { blob, error, isPreparing: enabled && !blob && !error, retry };
}
