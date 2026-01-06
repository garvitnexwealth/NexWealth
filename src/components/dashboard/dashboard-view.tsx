"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency } from "@/lib/format";
import { useToast } from "@/components/ui/toast";

const ranges = ["1M", "3M", "1Y", "ALL"] as const;

type Range = (typeof ranges)[number];

type DashboardResponse = {
  currency: "INR" | "USD";
  metrics: {
    realEstate: number;
    liabilities: number;
    investments: number;
    monthlyInvestments: number;
    netWorth: number;
  };
  trend: {
    range: Range;
    points: { date: string; value: number }[];
  };
  allocation: {
    total: number;
    items: { category: string; value: number }[];
  };
  tiles: Array<{
    category: string;
    total: number;
    items: Array<{
      label: string;
      value: number;
      invested: number | null;
      gainPct: number | null;
      gainAbs: number | null;
      allocationPct: number;
    }>;
  }>;
  warnings: string[];
};

const allocationColors = [
  "#2dd4bf",
  "#38bdf8",
  "#a78bfa",
  "#facc15",
  "#fb7185",
  "#34d399",
  "#e2e8f0",
  "#94a3b8",
];

export default function DashboardView() {
  const [range, setRange] = useState<Range>("3M");
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");
  const [error, setError] = useState<string | null>(null);
  const { push } = useToast();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const stored = window.localStorage.getItem("displayCurrency");
    if (stored === "INR" || stored === "USD") {
      setCurrency(stored);
    }

    const handler = () => {
      const latest = window.localStorage.getItem("displayCurrency");
      if (latest === "INR" || latest === "USD") {
        setCurrency(latest);
      }
    };

    window.addEventListener("displayCurrencyChange", handler);
    return () => window.removeEventListener("displayCurrencyChange", handler);
  }, []);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/dashboard?range=${range}&currency=${currency}`);
      if (!response.ok) {
        setError("Failed to load dashboard data.");
        push("Dashboard data could not be loaded.");
        setLoading(false);
        return;
      }
      const payload = (await response.json()) as DashboardResponse;
      if (alive) {
        setData(payload);
        setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [range, currency]);

  const allocationLegend = useMemo(() => {
    if (!data) return [];
    return data.allocation.items.map((item, index) => ({
      ...item,
      color: allocationColors[index % allocationColors.length],
      percent: data.allocation.total
        ? (item.value / data.allocation.total) * 100
        : 0,
    }));
  }, [data]);

  if (loading || !data) {
    return (
      <div className="card space-y-4 p-8">
        {error ? (
          <p className="text-sm text-slate-400">{error}</p>
        ) : (
          <>
            <div className="h-4 w-40 animate-pulse rounded-full bg-ink-700" />
            <div className="h-3 w-3/4 animate-pulse rounded-full bg-ink-800" />
            <div className="h-3 w-2/3 animate-pulse rounded-full bg-ink-800" />
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {data.warnings.length > 0 && (
        <div className="rounded-2xl border border-teal-400/30 bg-ink-850/70 p-4 text-sm text-teal-200">
          {data.warnings.join(" ")}
        </div>
      )}

      <section className="grid gap-4 lg:grid-cols-5">
        {[
          { label: "Real Estate", value: data.metrics.realEstate },
          { label: "Liabilities", value: data.metrics.liabilities },
          { label: "Current Investments", value: data.metrics.investments },
          { label: "Monthly Investments", value: data.metrics.monthlyInvestments },
          { label: "Net Worth", value: data.metrics.netWorth },
        ].map((card) => (
          <div key={card.label} className="card p-5">
            <p className="card-title">{card.label}</p>
            <p className="mt-3 text-2xl font-semibold text-white">
              {formatCurrency(card.value, data.currency)}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="card-title">Net Worth Trend</p>
              <h3 className="mt-2 text-xl font-semibold">Momentum view</h3>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-ink-850 px-2 py-1">
              {ranges.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setRange(option)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    range === option
                      ? "bg-teal-400 text-ink-950"
                      : "text-slate-400 hover:text-slate-100"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.trend.points}>
                <defs>
                  <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis stroke="#64748b" tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    borderRadius: 12,
                    border: "1px solid #1f2937",
                  }}
                  formatter={(value) => formatCurrency(Number(value), data.currency)}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#2dd4bf"
                  strokeWidth={2}
                  fill="url(#trendFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <p className="card-title">Allocation</p>
          <h3 className="mt-2 text-xl font-semibold">Portfolio mix</h3>
          <div className="mt-6 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationLegend}
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                >
                  {allocationLegend.map((entry) => (
                    <Cell key={entry.category} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    borderRadius: 12,
                    border: "1px solid #1f2937",
                  }}
                  formatter={(value) => formatCurrency(Number(value), data.currency)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {allocationLegend.map((item) => (
              <div key={item.category} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
                  <span className="text-slate-300">{item.category}</span>
                </div>
                <div className="text-slate-400">
                  {item.percent.toFixed(1)}% / {formatCurrency(item.value, data.currency)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {data.tiles.map((tile) => (
          <div key={tile.category} className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="card-title">{tile.category}</p>
                <p className="mt-3 text-2xl font-semibold text-white">
                  {formatCurrency(tile.total, data.currency)}
                </p>
              </div>
              <div className="h-20 w-24">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tile.items.slice(0, 6)}>
                    <Bar dataKey="value" fill="#2dd4bf" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="mt-5 space-y-3 text-sm">
              {tile.items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-ink-700 p-4 text-xs text-slate-500">
                  No valuations yet. Add snapshots or prices to populate this tile.
                </div>
              ) : (
                tile.items.map((item) => (
                  <div key={item.label} className="rounded-xl bg-ink-850/70 p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-100">{item.label}</p>
                      <p className="text-slate-300">
                        {formatCurrency(item.value, data.currency)}
                      </p>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
                      <span>
                        Invested {item.invested === null ? "--" : formatCurrency(item.invested, data.currency)}
                      </span>
                      <span>
                        Gain {item.gainAbs === null ? "--" : formatCurrency(item.gainAbs, data.currency)}
                      </span>
                      <span>
                        {item.gainPct === null ? "--" : `${item.gainPct.toFixed(1)}%`}
                      </span>
                      <span>{item.allocationPct.toFixed(1)}% alloc</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
