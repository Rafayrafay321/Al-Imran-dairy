// filepath: app/bills/page.tsx
import { Suspense } from "react";
import { BillsListScreen } from "@/components/bills/list/BillsListScreen";
import { PageSkeleton } from "@/components/common/PageSkeleton";

export default function BillsPage() {
  return (
    <Suspense fallback={<main className="mx-auto w-full max-w-md p-4"><PageSkeleton /></main>}>
        <BillsListScreen />
    </Suspense>
  );
}
