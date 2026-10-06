// filepath: components/home/actions/WeeklyBillsCard.tsx
import * as React from "react";
import { PlusCircle } from "lucide-react";
import { ActionCardBase } from "./ActionCardBase";

interface WeeklyBillsCardProps { isVisible: boolean; }

export function WeeklyBillsCard({ isVisible }: WeeklyBillsCardProps) {
  if (!isVisible) return null;

  return (
    <ActionCardBase
      title="New Weekly Bill"
      subtitle="Create weekly consolidated bill"
      icon={<PlusCircle className="h-6 w-6 text-[#2563EB]" />}
      variant="default"
      href="/bills/new"
    />
  );
}
