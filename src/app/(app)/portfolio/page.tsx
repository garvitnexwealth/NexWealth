"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer } from "recharts";

import { handleUnauthorized } from "@/lib/client-auth";
import { formatCurrency } from "@/lib/format";
import { useToast } from "@/components/ui/toast";

type DashboardResponse = {
  currency: "INR" | "USD";
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
};

export default function PortfolioPage() {
  const [tiles, setTiles] = useState<DashboardResponse["tiles"]>([]);
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");
  const [loading, setLoading] = useState(true);
  const { push } = useToast();

  useEffect(() => {
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
      const response = await fetch(`/api/dashboard?range=3M&currency=${currency}`);
      if (handleUnauthorized(response)) {
        setLoading(false);
        return;
      }
      if (!response.ok) {
        push("Unable to load portfolio tiles.");
        setLoading(false);
        return;
      }
      const payload = (await response.json()) as DashboardResponse;
      if (alive) {
        setTiles(payload.tiles);
        setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [currency, push]);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Portfolio</p>
        <h1 className="mt-2 text-3xl font-semibold">Holdings overview</h1>
      </header>

      <section className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <div className="card p-6">
            <p className="text-sm text-slate-400">Loading portfolio tiles...</p>
          </div>
        ) : (
          tiles.map((tile) => (
            <div key={tile.category} className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="card-title">{tile.category}</p>
                  <p className="mt-3 text-2xl font-semibold text-white">
                    {formatCurrency(tile.total, currency)}
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
                          {formatCurrency(item.value, currency)}
                        </p>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
                        <span>
                          Invested {item.invested === null ? "--" : formatCurrency(item.invested, currency)}
                        </span>
                        <span>
                          Gain {item.gainAbs === null ? "--" : formatCurrency(item.gainAbs, currency)}
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
          ))
        )}
      </section>

      <section className="card p-6">
        <div className="flex flex-wrap items-center gap-3">
          {[
            "Category",
            "Platform",
            "Sub-account Type",
            "Currency",
          ].map((label) => (
            <div key={label} className="rounded-full bg-ink-850 px-4 py-2 text-xs text-slate-300">
              {label}
            </div>
          ))}
          <button className="ml-auto rounded-full bg-teal-400 px-4 py-2 text-xs font-semibold text-ink-950">
            Filter
          </button>
        </div>
        <div className="mt-6 overflow-hidden rounded-xl border border-ink-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-850 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Holding</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Current Value</th>
                <th className="px-4 py-3">Invested</th>
                <th className="px-4 py-3">Gain/Loss</th>
                <th className="px-4 py-3">Platform</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-800 text-slate-300">
              <tr>
                <td className="px-4 py-3">Parag Parikh Flexi Cap</td>
                <td className="px-4 py-3">MF</td>
                <td className="px-4 py-3">INR 8,40,000</td>
                <td className="px-4 py-3">INR 7,10,000</td>
                <td className="px-4 py-3 text-teal-300">+18.3%</td>
                <td className="px-4 py-3">Groww</td>
              </tr>
              <tr>
                <td className="px-4 py-3">US Tech Basket</td>
                <td className="px-4 py-3">US Stocks</td>
                <td className="px-4 py-3">USD 12,500</td>
                <td className="px-4 py-3">USD 10,400</td>
                <td className="px-4 py-3 text-teal-300">+20.2%</td>
                <td className="px-4 py-3">INDmoney</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Emergency Fund</td>
                <td className="px-4 py-3">Cash</td>
                <td className="px-4 py-3">INR 2,50,000</td>
                <td className="px-4 py-3">--</td>
                <td className="px-4 py-3">--</td>
                <td className="px-4 py-3">ICICI</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
