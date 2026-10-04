// filepath: app/bills/new/page.tsx
import { NewWeeklyBillScreen } from "@/components/bills/create/NewWeeklyBillScreen";

interface NewWeeklyBillPageProps {
  searchParams: Promise<{ customerId?: string }>;
}

export default async function NewWeeklyBillPage({ searchParams }: NewWeeklyBillPageProps) {
  const { customerId } = await searchParams;
  return <NewWeeklyBillScreen initialCustomerId={customerId} />;
}
