"use client";

import { useState } from "react";

export default function TransactionsPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Transactions</p>
          <h1 className="mt-2 text-3xl font-semibold">Activity ledger</h1>
        </div>
        <button
          className="rounded-full bg-teal-400 px-5 py-2 text-sm font-semibold text-ink-950"
          onClick={() => setOpen(true)}
        >
          Add transaction
        </button>
      </header>

      <section className="card p-6">
        <div className="flex flex-wrap items-center gap-3">
          {[
            "Action",
            "Platform",
            "Stock",
            "Date range",
          ].map((label) => (
            <div key={label} className="rounded-full bg-ink-850 px-4 py-2 text-xs text-slate-300">
              {label}
            </div>
          ))}
          <button className="ml-auto rounded-full bg-ink-850 px-4 py-2 text-xs text-slate-200">
            Clear
          </button>
        </div>
        <div className="mt-6 overflow-hidden rounded-xl border border-ink-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-850 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Asset</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Platform</th>
                <th className="px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-800 text-slate-300">
              <tr>
                <td className="px-4 py-3">2024-12-02</td>
                <td className="px-4 py-3 text-teal-300">BUY</td>
                <td className="px-4 py-3">TCS</td>
                <td className="px-4 py-3">INR 1,25,000</td>
                <td className="px-4 py-3">Groww</td>
                <td className="px-4 py-3">Long-term</td>
              </tr>
              <tr>
                <td className="px-4 py-3">2024-12-01</td>
                <td className="px-4 py-3 text-slate-200">DEPOSIT</td>
                <td className="px-4 py-3">ICICI Savings</td>
                <td className="px-4 py-3">INR 60,000</td>
                <td className="px-4 py-3">ICICI</td>
                <td className="px-4 py-3">Salary</td>
              </tr>
              <tr>
                <td className="px-4 py-3">2024-11-22</td>
                <td className="px-4 py-3 text-rose-300">EMI</td>
                <td className="px-4 py-3">Home Loan</td>
                <td className="px-4 py-3">INR 45,000</td>
                <td className="px-4 py-3">HDFC</td>
                <td className="px-4 py-3">Monthly payment</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="card w-full max-w-xl p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">New transaction</h3>
              <button
                className="rounded-full bg-ink-850 px-3 py-1 text-xs text-slate-300"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {["Action", "Platform account", "Asset", "Amount", "Date", "Notes"].map((label) => (
                <input
                  key={label}
                  placeholder={label}
                  className="w-full rounded-xl border border-ink-800 bg-ink-850 px-4 py-3 text-sm"
                />
              ))}
            </div>
            <button className="mt-6 w-full rounded-full bg-teal-400 px-4 py-3 text-sm font-semibold text-ink-950">
              Save transaction
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
