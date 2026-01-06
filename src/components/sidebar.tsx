import Link from "next/link";

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
  return (
    <aside className="hidden h-screen w-64 flex-col gap-8 border-r border-ink-800 bg-ink-950/80 px-6 py-8 lg:flex">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">FinanceHub</p>
        <p className="mt-2 text-2xl font-display text-teal-300">Wealth OS</p>
      </div>

      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-3 rounded-xl px-3 py-2 text-slate-300 transition hover:bg-ink-800 hover:text-white"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-850 text-slate-200 group-hover:text-teal-300">
                <Icon />
              </span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-ink-800 bg-ink-850/60 p-4 text-xs text-slate-300">
        <p className="font-semibold text-slate-100">Account Pulse</p>
        <p className="mt-2 text-slate-400">Sync your latest valuations for sharper insights.</p>
        <button className="mt-4 w-full rounded-lg bg-teal-500 px-3 py-2 text-xs font-semibold text-ink-950 transition hover:bg-teal-400">
          Update valuations
        </button>
      </div>
    </aside>
  );
}
