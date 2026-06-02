import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminCookieName, verifyAdminSessionToken } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Widget Analytics | CashOfferChat" };

type EventRow = {
  id: string;
  created_at: string;
  event_name: string;
  site_id: string;
  source_url: string | null;
  page_domain: string | null;
  conversation_id: string | null;
  lead_id: string | null;
};

type LeadRow = {
  id: string;
  created_at: string;
  source_url: string | null;
};

type CountCardProps = { label: string; value: number; help?: string };

function CountCard({ label, value, help }: CountCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-4xl font-bold text-navy">{value}</p>
      {help && <p className="mt-2 text-xs leading-5 text-slate-500">{help}</p>}
    </div>
  );
}

function eventLabel(value: string) {
  return value.replaceAll("_", " ");
}

function todayStartIso() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.toISOString();
}

function last7DaysIso() {
  const now = new Date();
  now.setDate(now.getDate() - 7);
  return now.toISOString();
}

export default async function AnalyticsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName())?.value;
  if (!verifyAdminSessionToken(token)) redirect("/admin/login");

  const supabase = getSupabaseAdmin();
  let events: EventRow[] = [];
  let leads: LeadRow[] = [];
  let errorMessage: string | null = null;

  if (!supabase) {
    errorMessage = "Supabase is not configured. Add environment variables before testing analytics.";
  } else {
    const [eventsResult, leadsResult] = await Promise.all([
      supabase
        .from("widget_events")
        .select("id, created_at, event_name, site_id, source_url, page_domain, conversation_id, lead_id")
        .order("created_at", { ascending: false })
        .limit(250),
      supabase
        .from("seller_leads")
        .select("id, created_at, source_url")
        .order("created_at", { ascending: false })
        .limit(250),
    ]);

    if (eventsResult.error) errorMessage = eventsResult.error.message;
    events = (eventsResult.data || []) as EventRow[];
    leads = (leadsResult.data || []) as LeadRow[];
  }

  const today = todayStartIso();
  const sevenDays = last7DaysIso();
  const eventsToday = events.filter((event) => event.created_at >= today);
  const leadsToday = leads.filter((lead) => lead.created_at >= today);
  const events7 = events.filter((event) => event.created_at >= sevenDays);
  const leads7 = leads.filter((lead) => lead.created_at >= sevenDays);

  const byEvent = events.reduce<Record<string, number>>((acc, event) => {
    acc[event.event_name] = (acc[event.event_name] || 0) + 1;
    return acc;
  }, {});

  const byDomain = events.reduce<Record<string, number>>((acc, event) => {
    const key = event.page_domain || "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const topEvents = Object.entries(byEvent).sort((a, b) => b[1] - a[1]);
  const topDomains = Object.entries(byDomain).sort((a, b) => b[1] - a[1]);

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold text-navy">Widget Analytics</h1>
            <p className="text-sm text-slate-500">Basic event tracking for the CashOfferChat widget</p>
          </div>
          <div className="flex gap-3">
            <Link className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-navy" href="/admin">Leads</Link>
            <Link className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-navy" href="/admin/settings">Settings</Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        {errorMessage && <div className="mb-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">{errorMessage}</div>}

        <div className="grid gap-5 md:grid-cols-4">
          <CountCard label="Events Today" value={eventsToday.length} help="Widget opens, chats, form opens, and lead submissions." />
          <CountCard label="Leads Today" value={leadsToday.length} help="Saved seller leads from the intake form." />
          <CountCard label="Events Last 7 Days" value={events7.length} />
          <CountCard label="Leads Last 7 Days" value={leads7.length} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-navy">Events by Type</h2>
            <div className="mt-5 space-y-3">
              {topEvents.length === 0 && <p className="text-sm text-slate-500">No widget events yet.</p>}
              {topEvents.map(([name, count]) => (
                <div key={name} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                  <span className="font-semibold capitalize text-slate-700">{eventLabel(name)}</span>
                  <span className="font-bold text-navy">{count}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-navy">Events by Domain</h2>
            <div className="mt-5 space-y-3">
              {topDomains.length === 0 && <p className="text-sm text-slate-500">No domain activity yet.</p>}
              {topDomains.map(([domain, count]) => (
                <div key={domain} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                  <span className="font-semibold text-slate-700">{domain}</span>
                  <span className="font-bold text-navy">{count}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-8 overflow-hidden rounded-[2rem] bg-white shadow-soft ring-1 ring-slate-200">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-xl font-bold text-navy">Recent Widget Events</h2>
            <p className="mt-1 text-sm text-slate-500">Latest tracked actions from embedded widgets.</p>
          </div>
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Event</th>
                <th className="px-5 py-4">Domain</th>
                <th className="px-5 py-4">Source URL</th>
                <th className="px-5 py-4">Lead</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events.length === 0 && <tr><td className="px-5 py-8 text-center text-slate-500" colSpan={5}>No events yet.</td></tr>}
              {events.slice(0, 50).map((event) => (
                <tr key={event.id} className="align-top">
                  <td className="px-5 py-4 text-slate-500">{new Date(event.created_at).toLocaleString()}</td>
                  <td className="px-5 py-4 font-semibold capitalize text-navy">{eventLabel(event.event_name)}</td>
                  <td className="px-5 py-4 text-slate-600">{event.page_domain || "—"}</td>
                  <td className="max-w-md truncate px-5 py-4 text-slate-600">{event.source_url || "—"}</td>
                  <td className="px-5 py-4">{event.lead_id ? <Link className="font-bold text-navy underline" href={`/admin/leads/${event.lead_id}`}>View lead</Link> : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </section>
    </main>
  );
}
