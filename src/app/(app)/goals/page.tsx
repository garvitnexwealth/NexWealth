export default function GoalsPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Goals</p>
          <h1 className="mt-2 text-3xl font-semibold">Goal tracking</h1>
        </div>
        <button className="rounded-full bg-teal-400 px-5 py-2 text-sm font-semibold text-ink-950">
          Create goal
        </button>
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        {["Europe Trip", "Home Upgrade", "Retirement Corpus"].map((goal) => (
          <div key={goal} className="card p-5">
            <p className="text-sm text-slate-400">{goal}</p>
            <p className="mt-3 text-2xl font-semibold text-white">INR 18,50,000</p>
            <div className="mt-4 h-2 w-full rounded-full bg-ink-850">
              <div className="h-2 w-[55%] rounded-full bg-teal-400" />
            </div>
            <p className="mt-3 text-xs text-slate-400">Required monthly: INR 38,000</p>
          </div>
        ))}
      </section>

      <section className="card p-6">
        <h3 className="text-lg font-semibold">Active goals</h3>
        <div className="mt-4 space-y-3">
          {[
            { name: "Europe Trip", progress: "55%", target: "Dec 2025" },
            { name: "Home Upgrade", progress: "22%", target: "Jun 2026" },
          ].map((item) => (
            <div key={item.name} className="rounded-xl bg-ink-850/70 p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-slate-100">{item.name}</p>
                <p className="text-sm text-slate-400">{item.target}</p>
              </div>
              <p className="mt-2 text-xs text-slate-400">Progress {item.progress}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
