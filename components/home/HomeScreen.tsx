// filepath: components/home/HomeScreen.tsx
"use client";

import * as React from "react";
import { useHomeScreenData } from "@/hooks/useHomeScreenData";
import { HomeTopBar } from "./top-bar/HomeTopBar";
import { UserGreeting } from "./greeting/UserGreeting";
import { HomeActionStack } from "./actions/HomeActionStack";
import { TodaySummaryCard } from "./summary/TodaySummaryCard";
import { PageSkeleton } from "@/components/common/PageSkeleton";

export function HomeScreen() {
  const {
    currentUser,
    firstName,
    formattedDate,
    todayMetrics,
    isOwner,
    role,
    isLoading,
    error,
    handleLogout,
  } = useHomeScreenData();

  if (isLoading) return <main className="mx-auto min-h-screen w-full max-w-md p-4"><PageSkeleton rows={4} /></main>;

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#FAFAF9] overflow-x-hidden">
      {/* Sticky Top Bar with Brand & Profile */}
      <HomeTopBar
        userName={currentUser?.name || ""}
        userRole={role}
        onLogout={handleLogout}
      />

      {/* Main Content Area - Mobile-first centered max-w-md column */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-5 sm:px-6 sm:py-6 space-y-5 pb-10">
        {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        {/* User Greeting & Today's Date */}
        <UserGreeting
          firstName={firstName}
          formattedDate={formattedDate}
        />

        {/* Main Action Cards */}
        <HomeActionStack isOwner={isOwner} />

        {/* Today's Summary Card */}
        <TodaySummaryCard metrics={todayMetrics} />
      </main>
    </div>
  );
}
