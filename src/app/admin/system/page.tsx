import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminCookieName, verifyAdminSessionToken } from "@/lib/auth";
import { AdminNav } from "@/components/AdminNav";
import { getSystemHealth, type HealthItem } from "@/lib/systemHealth";

export const dynamic = "force-dynamic";
export const metadata = { title: "System Health | CashOfferChat" };

function StatusBadge({ status }: { status: HealthItem["status"] }) {
  const classes =
    status === "ok"
      ? "bg-green-50 text-green-700"
      : status === "warning"
        ? "bg-amber-50 text-amber-800"
        : "bg-red-50 text-red-700";

  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${classes}`}>{status.toUpperCase()}</span>;
}

function HealthSection({ title, items }: { title: string; items: HealthItem[] }) {
  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
      <h2 className="text-xl font-bold text-navy">{title}</h2>
      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Message</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.name}>
                <td className="px-4 py-3 font-semibold text-navy">{item.name}</td>
                <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                <td className="px-4 py-3 text-slate-600">{item.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default async function AdminSystemPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName())?.value;
  if (!verifyAdminSessionToken(token)) redirect("/admin/login");

  const health = await getSystemHealth();

  return (
    <main className="min-h-screen bg-slate-50">
      <AdminNav title="System Health" subtitle="Check configuration, database tables, and route files." />
      <section className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-navy">Overall Status</h2>
              <p className="mt-1 text-sm text-slate-500">Last checked: {new Date(health.checkedAt).toLocaleString()}</p>
            </div>
            <StatusBadge status={health.overallStatus} />
          </div>
          <div className="mt-4 text-sm text-slate-600">
            API JSON: <code className="rounded bg-slate-100 px-2 py-1">/api/admin/system/health</code>
          </div>
        </div>

        <HealthSection title="Environment Variables" items={health.env} />
        <HealthSection title="Supabase Tables" items={health.tables} />
        <HealthSection title="Route Files" items={health.routes} />
      </section>
    </main>
  );
}
