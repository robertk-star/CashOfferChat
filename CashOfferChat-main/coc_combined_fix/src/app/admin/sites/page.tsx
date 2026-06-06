import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminCookieName, verifyAdminSessionToken } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Widget Sites | CashOfferChat" };

type Business = {
  id: string;
  name: string;
};

type WidgetSite = {
  id: string;
  business_id: string | null;
  site_id: string;
  name: string | null;
  site_name: string | null;
  domain: string | null;
  allowed_domains: string | null;
  is_active: boolean | null;
  businesses: { name?: string | null } | { name?: string | null }[] | null;
};

function businessName(value: WidgetSite["businesses"]) {
  if (!value) return "—";
  if (Array.isArray(value)) return value[0]?.name || "—";
  return value.name || "—";
}

export default async function AdminSitesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const query = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName())?.value;
  if (!verifyAdminSessionToken(token)) redirect("/admin/login");

  const supabase = getSupabaseAdmin();
  let businesses: Business[] = [];
  let sites: WidgetSite[] = [];
  let leadCounts: Record<string, number> = {};
  let errorMessage: string | null = query.error ? "Widget site could not be saved. Check required fields and make sure Site ID is unique." : null;

  if (!supabase) {
    errorMessage = "Supabase is not configured.";
  } else {
    const businessResult = await supabase
      .from("businesses")
      .select("id, name")
      .order("name", { ascending: true });

    businesses = (businessResult.data || []) as Business[];

    const sitesResult = await supabase
      .from("widget_sites")
      .select("id, business_id, site_id, name, site_name, domain, allowed_domains, is_active, businesses(name)")
      .order("created_at", { ascending: false });

    if (sitesResult.error) {
      errorMessage = sitesResult.error.message;
    } else {
      sites = (sitesResult.data || []) as unknown as WidgetSite[];
    }

    const leadResult = await supabase
      .from("seller_leads")
      .select("site_id");

    for (const row of leadResult.data || []) {
      if (!row.site_id) continue;
      leadCounts[row.site_id] = (leadCounts[row.site_id] || 0) + 1;
    }
  }

  const widgetBaseUrl = "https://www.cashofferchat.com";
  const widgetScriptVersion = "embed-sync-canonical-api-20260606e";

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <Link href="/admin" className="text-sm font-bold text-slate-500 underline">Back to Admin Dashboard</Link>
            <h1 className="mt-2 text-2xl font-bold text-navy">Widget Sites</h1>
            <p className="text-sm text-slate-500">Create and manage widget embed sites.</p>
          </div>
          <form action="/api/admin/logout" method="post">
            <button className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-navy">Log Out</button>
          </form>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        {query.saved && <div className="mb-6 rounded-2xl bg-green-50 p-4 text-sm text-green-800">Widget site saved.</div>}
        {errorMessage && <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{errorMessage}</div>}

        <div className="mb-8 rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
          <h2 className="text-xl font-bold text-navy">Add Widget Site</h2>
          <p className="mt-2 text-sm text-slate-500">Required fields are marked with *.</p>

          <form action="/api/admin/sites" method="post" className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-700">
              Business *
              <select name="business_id" required className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3">
                <option value="">Select a business</option>
                {businesses.map((business) => (
                  <option key={business.id} value={business.id}>{business.name}</option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Site ID *
              <input name="site_id" required placeholder="plano-demo" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
              <span className="mt-1 block text-xs text-slate-500">Lowercase letters, numbers, and hyphens. This becomes the widget data-site-id.</span>
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Site Name
              <input name="site_name" placeholder="Plano Demo Site" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Primary Domain
              <input name="domain" placeholder="sellmyhousetodayanywhere.com" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
            </label>

            <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
              Allowed Domains
              <textarea name="allowed_domains" placeholder={"sellmyhousetodayanywhere.com\nwww.sellmyhousetodayanywhere.com"} className="mt-1 min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3" />
            </label>

            <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
              <input name="is_active" type="checkbox" defaultChecked /> Active
            </label>

            <div className="md:col-span-2">
              <button className="rounded-full bg-gold px-7 py-3 font-bold text-navy" type="submit">
                Save Widget Site
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-5">
          {sites.length === 0 && (
            <div className="rounded-[2rem] bg-white p-8 text-center text-sm text-slate-500 shadow-soft ring-1 ring-slate-200">
              No widget sites yet.
            </div>
          )}

          {sites.map((site) => {
            const label = site.site_name || site.name || site.site_id;
            return (
              <div key={site.id} className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-navy">{label}</h3>
                    <p className="text-sm text-slate-500">Business: {businessName(site.businesses)}</p>
                    <p className="text-sm text-slate-500">Site ID: {site.site_id}</p>
                    <p className="text-sm text-slate-500">Domain: {site.domain || "—"}</p>
                    <p className="text-sm text-slate-500">Leads: {leadCounts[site.site_id] || 0}</p>
                  </div>
                  <div className="flex flex-col items-start gap-3 lg:items-end">
                    <span className={site.is_active === false ? "rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700" : "rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700"}>
                      {site.is_active === false ? "Inactive" : "Active"}
                    </span>
                    <Link href={`/admin/sites/${site.id}`} className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-navy">
                      Open Site
                    </Link>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="text-sm font-bold text-slate-700">Embed code</div>
                  <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-50 p-4 text-xs text-slate-700">{`<script src="${widgetBaseUrl}/widget.js?v=${widgetScriptVersion}" data-site-id="${site.site_id}"></script>`}</pre>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
