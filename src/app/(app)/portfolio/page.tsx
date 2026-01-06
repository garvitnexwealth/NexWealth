export default function PortfolioPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Portfolio</p>
        <h1 className="mt-2 text-3xl font-semibold">Holdings overview</h1>
      </header>

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
                <td className="px-4 py-3">$ 12,500</td>
                <td className="px-4 py-3">$ 10,400</td>
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
