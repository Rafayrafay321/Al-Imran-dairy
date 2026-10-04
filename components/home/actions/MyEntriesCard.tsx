import { FileText } from "lucide-react";
import { ActionCardBase } from "./ActionCardBase";

export function MyEntriesCard({ onClick }: { onClick?: () => void }) {
  return <ActionCardBase title="My Entries" subtitle="Bills created by me" icon={<FileText className="h-6 w-6 text-indigo-700" />} onClick={onClick} />;
}
