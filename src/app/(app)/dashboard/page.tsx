import DashboardView from "@/components/dashboard/dashboard-view";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold">Your financial control tower</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Track net worth, allocations, liabilities, and the momentum behind every asset class.
          Currency conversions adjust in real time based on your FX settings.
        </p>
      </header>
      <DashboardView />
    </div>
  );
}
