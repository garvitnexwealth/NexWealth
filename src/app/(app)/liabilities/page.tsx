"use client";

import { ResponsiveContainer, Area, AreaChart, Tooltip, XAxis, YAxis } from "recharts";

const trend = [
  { date: "Jan", value: 820000 },
  { date: "Feb", value: 805000 },
  { date: "Mar", value: 792000 },
  { date: "Apr", value: 775000 },
  { date: "May", value: 760000 },
  { date: "Jun", value: 748000 },
];

export default function LiabilitiesPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Liabilities</p>
          <h1 className="mt-2 text-3xl font-semibold">Outstanding obligations</h1>
        </div>
        <button className="rounded-full bg-teal-400 px-5 py-2 text-sm font-semibold text-ink-950">
          Add snapshot
        </button>
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        {["Home Loan", "Car Loan", "Credit Card"].map((item) => (
          <div key={item} className="card p-5">
            <p className="card-title">{item}</p>
            <p className="mt-3 text-2xl font-semibold text-white">INR 7,80,000</p>
            <p className="mt-2 text-xs text-slate-400">Next EMI due in 12 days</p>
          </div>
        ))}
      </section>

      <section className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="card-title">Outstanding trend</p>
            <h3 className="mt-2 text-xl font-semibold">Last 6 months</h3>
          </div>
          <button className="rounded-full bg-ink-850 px-4 py-2 text-xs text-slate-300">
            Export
          </button>
        </div>
        <div className="mt-6 h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="liabilityFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  background: "#0f172a",
                  borderRadius: 12,
                  border: "1px solid #1f2937",
                }}
              />
              <Area type="monotone" dataKey="value" stroke="#f43f5e" fill="url(#liabilityFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
