"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  AnalyticsIcon,
  GoalsIcon,
  HomeIcon,
  LiabilityIcon,
  PortfolioIcon,
  SettingsIcon,
  TransactionsIcon,
} from "@/components/icons";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/portfolio", label: "Portfolio", icon: PortfolioIcon },
  { href: "/transactions", label: "Transactions", icon: TransactionsIcon },
  { href: "/liabilities", label: "Liabilities", icon: LiabilityIcon },
  { href: "/analytics", label: "Analytics", icon: AnalyticsIcon },
  { href: "/goals", label: "Goals", icon: GoalsIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-56 flex-col gap-8 border-r border-ink-850 bg-ink-950/90 px-5 py-8 lg:flex">
      <div>
        <p className="text-xl uppercase tracking-[0.35em] text-slate-500">NexWealth</p>
      </div>

      <nav className="flex flex-col gap-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                isActive
                  ? "bg-teal-500/15 text-teal-200 shadow-[0_0_0_1px_rgba(45,212,191,0.25)]"
                  : "text-slate-400 hover:bg-ink-850 hover:text-white"
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  isActive ? "bg-teal-500/20 text-teal-200" : "bg-ink-850 text-slate-300"
                }`}
              >
                <Icon />
              </span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-ink-800 bg-gradient-to-br from-ink-850/70 via-ink-850/40 to-ink-950 p-4 text-xs text-slate-300">
        <p className="font-semibold text-slate-100">Upgrade Pro</p>
        <p className="mt-2 text-slate-400">
          Unlock deeper insights, automation, and smarter portfolio nudges.
        </p>
        <button className="mt-4 w-full rounded-full bg-teal-400 px-3 py-2 text-xs font-semibold text-ink-950 transition hover:bg-teal-300">
          Upgrade
        </button>
      </div>
    </aside>
  );
}
