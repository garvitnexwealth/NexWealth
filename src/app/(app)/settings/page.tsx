export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-[0.4em] text-slate-500">
          Settings
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Configuration</h1>
      </header>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="text-lg font-semibold">Enabled platforms</h3>
          <p className="mt-2 text-sm text-slate-400">
            Manage platform and sub-account access for your profile.
          </p>
          <div className="mt-4 space-y-3">
            {[
              "Groww - Indian Stocks",
              "INDmoney - US Stocks",
              "ICICI - Savings",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between rounded-xl bg-ink-850/70 p-3 text-sm"
              >
                <span>{item}</span>
                <button className="rounded-full bg-teal-400 px-3 py-1 text-xs font-semibold text-ink-950">
                  Manage
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold">Display currency</h3>
          <p className="mt-2 text-sm text-slate-400">
            Choose the default currency for dashboards and analytics.
          </p>
          <div className="mt-4 flex gap-3">
            <button className="rounded-full bg-teal-400 px-4 py-2 text-xs font-semibold text-ink-950">
              INR
            </button>
            <button className="rounded-full bg-ink-850 px-4 py-2 text-xs text-slate-200">
              USD
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="text-lg font-semibold">FX rates</h3>
          <p className="mt-2 text-sm text-slate-400">
            Add manual FX rates for conversions.
          </p>
          <div className="mt-4 space-y-2 text-sm text-slate-300">
            <div className="flex items-center justify-between rounded-xl bg-ink-850/70 p-3">
              <span>USD {"->"} INR</span>
              <span>83.10</span>
            </div>
            <button className="rounded-full bg-ink-850 px-4 py-2 text-xs text-slate-200">
              Add rate
            </button>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold">Manual valuations</h3>
          <p className="mt-2 text-sm text-slate-400">
            Maintain stock prices, real estate values, and snapshots.
          </p>
          <div className="mt-4 space-y-2 text-sm text-slate-300">
            <div className="rounded-xl bg-ink-850/70 p-3">Stock prices</div>
            <div className="rounded-xl bg-ink-850/70 p-3">
              Holding snapshots
            </div>
            <div className="rounded-xl bg-ink-850/70 p-3">
              Real estate valuations
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
