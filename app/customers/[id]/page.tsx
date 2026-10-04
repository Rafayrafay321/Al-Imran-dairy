// filepath: app/customers/[id]/page.tsx
import { CustomerDetailScreen } from "@/components/customers/detail/CustomerDetailScreen";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: PageProps) {
  const { id } = await params;

  return <CustomerDetailScreen customerId={id} />;
}
