"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";

const driftData = [
  { category: "MF", target: 30, actual: 28 },
  { category: "US", target: 25, actual: 32 },
  { category: "IND", target: 20, actual: 18 },
  { category: "Real Estate", target: 15, actual: 14 },
  { category: "Cash", target: 10, actual: 8 },
];

const concentration = [
  { name: "Top 5 holdings", value: 48 },
  { name: "Long tail", value: 52 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Analytics</p>
        <h1 className="mt-2 text-3xl font-semibold">Risk & performance signals</h1>
      </header>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="card p-6">
          <p className="card-title">Allocation drift</p>
          <h3 className="mt-2 text-xl font-semibold">Target vs Actual</h3>
          <div className="mt-6 h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={driftData}>
                <XAxis dataKey="category" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    borderRadius: 12,
                    border: "1px solid #1f2937",
                  }}
                />
                <Bar dataKey="target" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                <Bar dataKey="actual" fill="#2dd4bf" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <p className="card-title">Concentration risk</p>
          <h3 className="mt-2 text-xl font-semibold">Top holdings share</h3>
          <div className="mt-6 h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={concentration} dataKey="value" innerRadius={70} outerRadius={100}>
                  {concentration.map((entry, index) => (
                    <Cell key={entry.name} fill={index === 0 ? "#f59e0b" : "#334155"} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    borderRadius: 12,
                    border: "1px solid #1f2937",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="card p-6">
        <p className="card-title">Performance overview</p>
        <h3 className="mt-2 text-xl font-semibold">Quarterly momentum</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {["YTD Return", "Volatility", "Best asset"].map((label) => (
            <div key={label} className="rounded-xl border border-ink-800 bg-ink-850/60 p-4">
              <p className="text-xs text-slate-400">{label}</p>
              <p className="mt-2 text-lg font-semibold">+14.2%</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
