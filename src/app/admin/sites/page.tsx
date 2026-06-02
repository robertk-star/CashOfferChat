import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminCookieName, verifyAdminSessionToken } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Widget Sites | CashOfferChat" };

type SiteRow = {
  id: string;
  site_id: string;
  name: string;
  domain: string | null;
  allowed_domains: string | null;
  is_active: boolean;
  business_id: string | null;
  businesses: { name: string | null } | { name: string | null }[] | null;
};

function businessName(row: SiteRow) {
  const business = Array.isArray(row.businesses) ? row.businesses[0] : row.businesses;
  return business?.name || "—";
}

export default async function SitesPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName())?.value;
  if (!verifyAdminSessionToken(token)) redirect("/admin/login");

  const params = await searchParams;
  const supabase = getSupabaseAdmin();
  let sites: SiteRow[] = [];
  let errorMessage: string | null = params.error || null;

  if (!supabase) {
    errorMessage = "Supabase is not configured.";
  } else {
    const { data, error } = await supabase
      .from("widget_sites")
      .select("id, site_id, name, domain, allowed_domains, is_active, business_id, businesses(name)")
      .order("created_at", { ascending: true });
    if (error) errorMessage = error.message;
    sites = (data || []) as SiteRow[];
  }

  const appUrl = (process.env.APP_URL || "https://cashofferchat.com").replace(/\/$/, "");

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold text-navy">Widget Sites</h1>
            <p className="text-sm text-slate-500">Phase 3A foundation for multiple customer websites.</p>
          </div>
          <div className="flex gap-3">
            <Link className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-navy" href="/admin">Leads</Link>
            <Link className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-navy" href="/admin/settings">Settings</Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        {params.saved && <div className="mb-6 rounded-2xl bg-green-50 p-4 text-sm text-green-800">Widget site saved.</div>}
        {errorMessage && <div className="mb-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">{errorMessage}</div>}

        <section className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
          <h2 className="text-xl font-bold text-navy">Add / Update Widget Site</h2>
          <p className="mt-2 text-sm text-slate-600">Use a unique Site ID for each website. The embed code uses this value.</p>
          <form action="/api/admin/sites" method="post" className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-700">Site ID<input name="site_id" placeholder="demo" required className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" /></label>
            <label className="block text-sm font-semibold text-slate-700">Site Name<input name="name" placeholder="Plano demo site" required className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" /></label>
            <label className="block text-sm font-semibold text-slate-700">Business Name<input name="business_name" placeholder="Sell My House Today Anywhere" required className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" /></label>
            <label className="block text-sm font-semibold text-slate-700">Primary Domain<input name="domain" placeholder="sellmyhousetodayanywhere.com" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" /></label>
            <label className="block text-sm font-semibold text-slate-700 md:col-span-2">Allowed Domains<textarea name="allowed_domains" placeholder={"sellmyhousetodayanywhere.com
www.sellmyhousetodayanywhere.com"} className="mt-1 min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3" /></label>
            <label className="flex items-center gap-3 text-sm font-semibold text-slate-700"><input name="is_active" type="checkbox" defaultChecked /> Active</label>
            <div className="md:col-span-2"><button className="rounded-full bg-gold px-7 py-3 font-bold text-navy" type="submit">Save Widget Site</button></div>
          </form>
        </section>

        <section className="mt-8 overflow-hidden rounded-[2rem] bg-white shadow-soft ring-1 ring-slate-200">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-xl font-bold text-navy">Configured Sites</h2>
          </div>
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="px-5 py-4">Site</th><th className="px-5 py-4">Business</th><th className="px-5 py-4">Domain</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Embed Code</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sites.length === 0 && <tr><td className="px-5 py-8 text-center text-slate-500" colSpan={5}>No widget sites yet.</td></tr>}
              {sites.map((site) => (
                <tr key={site.id} className="align-top">
                  <td className="px-5 py-4"><div className="font-bold text-navy">{site.name}</div><div className="text-xs text-slate-500">{site.site_id}</div></td>
                  <td className="px-5 py-4 text-slate-600">{businessName(site)}</td>
                  <td className="px-5 py-4 text-slate-600">{site.domain || "—"}</td>
                  <td className="px-5 py-4"><span className={site.is_active ? "rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700" : "rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600"}>{site.is_active ? "Active" : "Inactive"}</span></td>
                  <td className="px-5 py-4"><code className="block max-w-xl whitespace-pre-wrap rounded-xl bg-slate-950 p-3 text-xs text-white">{`<script src="${appUrl}/widget.js" data-site-id="${site.site_id}"></script>`}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </section>
    </main>
  );
}
