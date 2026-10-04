// filepath: components/home/actions/CustomersCard.tsx
import * as React from "react";
import { Users } from "lucide-react";
import { ActionCardBase } from "./ActionCardBase";

interface CustomersCardProps {
  onClick?: () => void;
}

export function CustomersCard({ onClick }: CustomersCardProps) {
  return (
    <ActionCardBase
      title="Customers"
      subtitle="Profiles and balances"
      icon={<Users className="h-6 w-6 text-[#1C1917]" />}
      variant="default"
      onClick={onClick}
    />
  );
}
