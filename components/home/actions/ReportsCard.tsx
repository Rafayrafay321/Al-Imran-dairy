// filepath: components/home/actions/ReportsCard.tsx
import * as React from "react";
import { BarChart3 } from "lucide-react";
import { ActionCardBase } from "./ActionCardBase";

interface ReportsCardProps { isVisible: boolean; }

export function ReportsCard({ isVisible }: ReportsCardProps) {
  if (!isVisible) return null;

  return (
    <ActionCardBase
      title="Reports"
      subtitle="Balances, weekly & daily Sales"
      icon={<BarChart3 className="h-6 w-6 text-[#1C1917]" />}
      variant="default"
      href="/reports"
    />
  );
}
