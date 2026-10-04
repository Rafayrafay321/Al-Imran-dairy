// filepath: components/home/greeting/UserGreeting.tsx
import * as React from "react";

interface UserGreetingProps {
  firstName: string;
  formattedDate: string;
}

export function UserGreeting({ firstName, formattedDate }: UserGreetingProps) {
  return (
    <section className="w-full pt-1 pb-1">
      <h2 className="text-2xl font-bold tracking-tight text-[#1C1917] sm:text-3xl leading-snug">
        Hello, {firstName}
      </h2>
      <p className="text-sm font-normal text-[#78716C] mt-1 capitalize leading-relaxed">
        {formattedDate}
      </p>
    </section>
  );
}
