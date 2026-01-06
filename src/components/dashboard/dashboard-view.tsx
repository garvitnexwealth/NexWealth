"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
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
import { handleUnauthorized } from "@/lib/client-auth";
import { SearchIcon } from "@/components/icons";

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

type TransactionResponse = {
  data: Array<{
    id: number;
    txnDate: string;
    txnAction: number;
    amount: string;
    currency: string;
    notes: string | null;
    platformAccount: {
      platform: { name: string };
      subAccountType: { name: string };
    };
    stock: { name: string } | null;
  }>;
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
  const [transactions, setTransactions] = useState<TransactionResponse["data"]>(
    []
  );
  const [transactionsLoading, setTransactionsLoading] = useState(true);
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
      const response = await fetch(
        `/api/dashboard?range=${range}&currency=${currency}`
      );
      if (handleUnauthorized(response)) {
        setLoading(false);
        return;
      }
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
  }, [range, currency, push]);

  useEffect(() => {
    let alive = true;
    async function loadTransactions() {
      setTransactionsLoading(true);
      const response = await fetch("/api/transactions?page=1&pageSize=6");
      if (handleUnauthorized(response)) {
        setTransactionsLoading(false);
        return;
      }
      if (!response.ok) {
        setTransactionsLoading(false);
        return;
      }
      const payload = (await response.json()) as TransactionResponse;
      if (alive) {
        setTransactions(payload.data);
        setTransactionsLoading(false);
      }
    }

    loadTransactions();
    return () => {
      alive = false;
    };
  }, []);

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

  const investmentSeries = [
    { label: "Mon", value: 4 },
    { label: "Tue", value: 6 },
    { label: "Wed", value: 5 },
    { label: "Thu", value: 7 },
    { label: "Fri", value: 9 },
    { label: "Sat", value: 6 },
    { label: "Sun", value: 8 },
  ];

  const liabilitySeries = [
    { label: "Jan", value: 18 },
    { label: "Feb", value: 22 },
    { label: "Mar", value: 19 },
    { label: "Apr", value: 26 },
    { label: "May", value: 21 },
    { label: "Jun", value: 24 },
  ];

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

  const netWorthSeries = data.trend.points.map((point) => ({
    label: point.date.slice(5),
    value: point.value,
  }));

  const renderActiveInvestmentBar = (props: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    value?: number;
    payload?: { label?: string };
  }) => {
    if (
      props.x === undefined ||
      props.y === undefined ||
      props.width === undefined ||
      props.height === undefined
    ) {
      return null;
    }

    const label = props.payload?.label ?? "";
    const text = `${label}: ${props.value ?? ""}`;

    return (
      <g>
        <rect
          x={props.x}
          y={props.y}
          width={props.width}
          height={props.height}
          fill="url(#investmentBarsHover)"
          rx={6}
          ry={6}
        />
        <text
          x={props.x + props.width / 2}
          y={props.y - 6}
          textAnchor="middle"
          fill="#e2e8f0"
          fontSize={10}
        >
          {text}
        </text>
      </g>
    );
  };

  const renderActiveLiabilityDot = (props: {
    cx?: number;
    cy?: number;
    payload?: { label?: string; value?: number };
  }) => {
    if (props.cx === undefined || props.cy === undefined) {
      return null;
    }

    const label = props.payload?.label ?? "";
    const text = `${label}: ${props.payload?.value ?? ""}`;

    return (
      <g>
        <circle cx={props.cx} cy={props.cy} r={4} fill="#3ef0df" />
        <text
          x={props.cx}
          y={props.cy - 10}
          textAnchor="middle"
          fill="#e2e8f0"
          fontSize={10}
        >
          {text}
        </text>
      </g>
    );
  };

  return (
    <div className="space-y-3">
      {data.warnings.length > 0 && (
        <div className="rounded-2xl border border-teal-400/30 bg-ink-850/70 p-4 text-sm text-teal-200">
          {data.warnings.join(" ")}
        </div>
      )}

      <section className="grid gap-3 lg:grid-cols-4">
        {[
          {
            label: "Total Liquid Investment",
            value: data.metrics.investments,
            delta: "+8%",
          },
          {
            label: "Monthly Savings + SIP",
            value: data.metrics.liabilities,
            delta: "+5%",
          },
          { label: "Net Worth", value: data.metrics.netWorth, delta: "+8%" },
          {
            label: "Total EMI",
            value: data.metrics.realEstate,
            delta: "+6%",
          },
        ].map((card) => (
          <div key={card.label} className="card kpi-card p-5">
            <p className="card-title">{card.label}</p>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-2xl font-semibold text-white">
                {formatCurrency(card.value, data.currency)}
              </p>
              <span className="rounded-full bg-teal-500/20 px-2 py-1 text-[10px] font-semibold text-teal-200">
                {card.delta}
              </span>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-3 xl:grid-cols-2">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <p className="card-title">Net Worth Trend</p>
            <p className="text-lg font-semibold text-slate-100">
              {formatCurrency(data.metrics.netWorth, data.currency)}
            </p>
          </div>
          <div className="mt-4 h-[210px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={netWorthSeries}>
                <defs>
                  <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  stroke="#64748b"
                  tickLine={false}
                  axisLine={{ stroke: "#2b323c" }}
                  tick={{ fill: "transparent" }}
                />
                <YAxis stroke="#64748b" />
                <CartesianGrid
                  vertical={false}
                  stroke="#1f2630"
                  strokeDasharray="3 3"
                />
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    borderRadius: 12,
                    border: "1px solid #1f2937",
                  }}
                  cursor={false}
                  formatter={(value) =>
                    formatCurrency(Number(value), data.currency)
                  }
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3ef0df"
                  strokeWidth={2}
                  fill="url(#trendFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4 pt-6">
          <p className="card-title">Portfolio Allocation</p>
          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="h-[180px]">
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
                    formatter={(value) =>
                      formatCurrency(Number(value), data.currency)
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 text-sm">
              {allocationLegend.map((item) => (
                <div
                  key={item.category}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: item.color }}
                    />
                    <span className="text-slate-300">{item.category}</span>
                  </div>
                  <div className="text-slate-400">
                    {item.percent.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 xl:grid-cols-4">
        <div className="card p-4 xl:col-span-2 pb-0">
          <div className="overflow-hidden rounded-xl border border-ink-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#232a33] text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-3">Transaction</th>
                  <th className="px-4 py-3">Platform</th>
                  <th className="px-4 py-3 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-800 text-slate-300">
                {transactionsLoading ? (
                  <tr>
                    <td
                      className="px-4 py-4 text-sm text-slate-400"
                      colSpan={3}
                    >
                      Loading transactions...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td
                      className="px-4 py-4 text-sm text-slate-400"
                      colSpan={3}
                    >
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  transactions.map((txn) => (
                    <tr key={txn.id}>
                      <td className="px-4 py-3">
                        <div className="text-xs text-slate-500">
                          {new Date(txn.txnDate).toISOString().slice(0, 10)}
                        </div>
                        <div className="font-medium text-slate-100">
                          {txn.stock?.name ??
                            txn.platformAccount.subAccountType.name}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">
                        {txn.platformAccount.platform.name}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-slate-200">
                        {formatCurrency(
                          Number(txn.amount),
                          txn.currency as "INR" | "USD"
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-4 pb-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="card-title">Investment Tracking (Monthly)</p>
            </div>
          </div>
          <div className="mt-4 h-[180px] -ml-10 -mr-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={investmentSeries}>
                <defs>
                  <linearGradient
                    id="investmentBars"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#38f2e0" stopOpacity={0.9} />
                    <stop
                      offset="100%"
                      stopColor="#38f2e0"
                      stopOpacity={0.15}
                    />
                  </linearGradient>
                  <linearGradient
                    id="investmentBarsHover"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#8ffbf0" stopOpacity={1} />
                    <stop
                      offset="100%"
                      stopColor="#38f2e0"
                      stopOpacity={0.35}
                    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  stroke="#475569"
                  tickLine={false}
                  axisLine={{ stroke: "#2b323c" }}
                  tick={{ fill: "transparent" }}
                />
                <YAxis stroke="#475569" />
                <CartesianGrid
                  vertical={false}
                  stroke="#1f2630"
                  strokeDasharray="3 3"
                />
                <Tooltip cursor={false} content={() => null} />
                <Bar
                  dataKey="value"
                  fill="url(#investmentBars)"
                  radius={[6, 6, 0, 0]}
                  stroke="none"
                  activeBar={renderActiveInvestmentBar}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4 pb-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="card-title">Liability Tracking (Monthly)</p>
            </div>
          </div>
          <div className="mt-4 h-[180px] -ml-10 -mr-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={liabilitySeries}>
                <defs>
                  <linearGradient
                    id="liabilityFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#38f2e0" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38f2e0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  stroke="#475569"
                  tickLine={false}
                  axisLine={{ stroke: "#2b323c" }}
                  tick={{ fill: "transparent" }}
                />
                <YAxis stroke="#475569" />
                <CartesianGrid
                  vertical={false}
                  stroke="#1f2630"
                  strokeDasharray="3 3"
                />
                <Tooltip cursor={false} content={() => null} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#38f2e0"
                  fill="url(#liabilityFill)"
                  activeDot={renderActiveLiabilityDot}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
}
