import { InvoiceDetailScreen } from "@/components/bills/detail/InvoiceDetailScreen";

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const { id } = await params;
  return <InvoiceDetailScreen invoiceId={id} />;
}
