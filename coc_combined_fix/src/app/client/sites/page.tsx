import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { clientCookieName, verifyClientSessionToken } from "@/lib/clientAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Widget Sites | CashOfferChat" };

function siteLabel(site: any) {
  return site.site_name || site.name || site.site_id || "Widget Site";
}

export default async function ClientSitesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(clientCookieName())?.value;
  const session = verifyClientSessionToken(token);
  if (!session) redirect("/client/login");

  const supabase = getSupabaseAdmin();
  let businessName = "Your Business";
  let sites: any[] = [];
  let leadCounts: Record<string, number> = {};
  let eventCounts: Record<string, number> = {};
  let errorMessage: string | null = null;

  if (!supabase) {
    errorMessage = "Supabase is not configured.";
  } else {
    const [businessResult, sitesResult, leadsResult, eventsResult] = await Promise.all([
      supabase.from("businesses").select("name").eq("id", session.businessId).maybeSingle(),
      supabase
        .from("widget_sites")
        .select("id, site_id, name, site_name, domain, allowed_domains, is_active, created_at")
        .eq("business_id", session.businessId)
        .order("created_at", { ascending: false }),
      supabase
        .from("seller_leads")
        .select("site_id")
        .eq("business_id", session.businessId),
      supabase
        .from("widget_events")
        .select("site_id")
        .eq("business_id", session.businessId),
    ]);

    businessName = businessResult.data?.name || businessName;

    if (sitesResult.error) errorMessage = sitesResult.error.message;
    sites = sitesResult.data || [];

    for (const lead of leadsResult.data || []) {
      if (!lead.site_id) continue;
      leadCounts[lead.site_id] = (leadCounts[lead.site_id] || 0) + 1;
    }

    for (const event of eventsResult.data || []) {
      if (!event.site_id) continue;
      eventCounts[event.site_id] = (eventCounts[event.site_id] || 0) + 1;
    }
  }

  const appUrl = process.env.APP_URL || "https://cashofferchat.com";

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <Link href="/client" className="text-sm font-bold text-slate-500 underline">Back to Client Dashboard</Link>
            <h1 className="mt-2 text-2xl font-bold text-navy">Widget Sites</h1>
            <p className="text-sm text-slate-500">{businessName} · Install and manage your website widget.</p>
          </div>
          <form action="/api/client/logout" method="post">
            <button className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-navy">Log Out</button>
          </form>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        {errorMessage && <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{errorMessage}</div>}

        <div className="mb-8 rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
          <h2 className="text-xl font-bold text-navy">How to Install</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-600">
            <li>Copy the embed code for the correct site below.</li>
            <li>Paste it before the closing <code className="rounded bg-slate-100 px-1">body</code> tag on your website.</li>
            <li>Open your website in a private/incognito browser window.</li>
            <li>Open the chat bubble and submit a test lead.</li>
            <li>Confirm the lead appears in your CashOfferChat dashboard.</li>
          </ol>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {sites.length === 0 && (
            <div className="rounded-[2rem] bg-white p-8 text-center text-sm text-slate-500 shadow-soft ring-1 ring-slate-200 lg:col-span-2">
              No widget sites have been assigned to this business yet.
            </div>
          )}

          {sites.map((site) => {
            const label = siteLabel(site);
            return (
              <div key={site.id} className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-navy">{label}</h3>
                    <p className="text-sm text-slate-500">Site ID: {site.site_id}</p>
                    <p className="text-sm text-slate-500">Domain: {site.domain || "No domain set"}</p>
                  </div>
                  <span className={site.is_active === false ? "rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700" : "rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700"}>
                    {site.is_active === false ? "Inactive" : "Active"}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Leads</div>
                    <div className="mt-1 text-2xl font-bold text-navy">{leadCounts[site.site_id] || 0}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Events</div>
                    <div className="mt-1 text-2xl font-bold text-navy">{eventCounts[site.site_id] || 0}</div>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="text-sm font-bold text-slate-700">Embed code</div>
                  <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-50 p-4 text-xs text-slate-700">{`<script src="${appUrl}/widget.js" data-site-id="${site.site_id}"></script>`}</pre>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href={`/client/sites/${site.id}`} className="rounded-full bg-gold px-5 py-2 text-sm font-bold text-navy">
                    Open Site Settings
                  </Link>
                  <Link href="/client/analytics" className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-navy">
                    View Analytics
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
