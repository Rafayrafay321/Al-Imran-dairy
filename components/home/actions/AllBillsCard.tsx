import { Receipt } from "lucide-react";
import { ActionCardBase } from "./ActionCardBase";

export function AllBillsCard({ onClick }: { onClick?: () => void }) {
  return <ActionCardBase title="All Bills" subtitle="View weekly bills and sharing status" icon={<Receipt className="h-6 w-6 text-teal-700" />} onClick={onClick} />;
}
