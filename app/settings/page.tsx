// filepath: app/settings/page.tsx
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { listStaffMembers } from "@/lib/services/staffService";
import { SettingsScreen } from "@/components/settings/SettingsScreen";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  try {
    await requireRole("OWNER");
  } catch {
    redirect("/");
  }

  const initialStaff = await listStaffMembers();
  return <SettingsScreen initialStaffList={initialStaff} />;
}
