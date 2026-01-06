import Sidebar from "@/components/sidebar";
import Topbar from "@/components/topbar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar />
        <main className="flex-1 space-y-8 px-4 py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
