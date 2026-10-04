// filepath: hooks/useHomeScreenData.ts
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  type User,
  type TodayMetrics,
  type UserRole,
} from "@/lib/data/types";
import { getCurrentUserAction, logoutAction } from "@/actions/authActions";
import { getTodayMetricsAction } from "@/actions/reportActions";

export function useHomeScreenData() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [todayMetrics, setTodayMetrics] = React.useState<TodayMetrics>({
    totalLiters: 0,
    billsCount: 0,
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const [metricsRes, user] = await Promise.all([
          getTodayMetricsAction(),
          getCurrentUserAction(),
        ]);
        if (mounted) {
          if (metricsRes.success && metricsRes.data) {
            setTodayMetrics(metricsRes.data);
          }
          if (user) {
            setCurrentUser(user);
          } else {
            router.push("/login");
          }
        }
      } catch {
        if (mounted) setError("Could not connect. Check your internet and try again.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, [router]);

  const displayName = currentUser?.name || "User";
  const firstName = displayName.split(" ")[0] || displayName;

  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  const handleLogout = async () => {
    await logoutAction();
  };

  const isOwner = currentUser?.role === "OWNER";
  const role: UserRole = (currentUser?.role || "STAFF") as UserRole;

  return {
    currentUser,
    firstName,
    formattedDate,
    todayMetrics,
    isOwner,
    role,
    isLoading,
    error,
    handleLogout,
  };
}
