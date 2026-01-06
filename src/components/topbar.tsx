"use client";

import Image from "next/image";

import CurrencyToggle from "@/components/currency-toggle";

export default function Topbar() {
  return (
    <header className="flex items-center justify-end gap-3 px-4 py-4 lg:px-8">
      <CurrencyToggle />
      <div className="flex items-center gap-3 rounded-full bg-ink-850/80 px-3 py-2">
        <Image
          src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=80&q=80"
          alt="User"
          width={32}
          height={32}
          className="h-8 w-8 rounded-full"
        />
        <div className="text-xs">
          <p className="font-semibold text-slate-100">Welcome</p>
          <p className="text-slate-400">NexWealth User</p>
        </div>
      </div>
    </header>
  );
}
