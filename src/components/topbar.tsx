"use client";

import { useState } from "react";
import Image from "next/image";

import CurrencyToggle from "@/components/currency-toggle";
import { BellIcon, SearchIcon } from "@/components/icons";

export default function Topbar() {
  const [query, setQuery] = useState("");

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-800 bg-ink-950/60 px-4 py-5 backdrop-blur lg:px-8">
      <div className="flex flex-1 items-center gap-3 rounded-full bg-ink-850 px-4 py-2 text-sm text-slate-300">
        <SearchIcon />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search transactions, platforms, or goals"
          className="w-full bg-transparent outline-none placeholder:text-slate-500"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <CurrencyToggle />
        <button className="flex h-11 w-11 items-center justify-center rounded-full bg-ink-850 text-slate-300 hover:text-teal-300">
          <BellIcon />
        </button>
        <div className="flex items-center gap-3 rounded-full bg-ink-850 px-3 py-2">
          <Image
            src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=80&q=80"
            alt="User"
            width={32}
            height={32}
            className="h-8 w-8 rounded-full"
          />
          <div className="text-xs">
            <p className="font-semibold text-slate-100">Welcome</p>
            <p className="text-slate-400">FinanceHub User</p>
          </div>
        </div>
      </div>
    </header>
  );
}
