import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { clientCookieName, verifyClientSessionToken } from "@/lib/clientAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Client Dashboard | CashOfferChat" };

type Lead = {
  id: string;
  created_at: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  property_address: string | null;
  property_city: string | null;
  timeline: string | null;
  situation: string | null;
  status: string | null;
};

type Site = {
  site_id: string;
  site_name: string | null;
  domain: string | null;
  is_active: boolean;
};

export default async function ClientDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(clientCookieName())?.value;
  const session = verifyClientSessionToken(token);
  if (!session) redirect("/client/login");

  const supabase = getSupabaseAdmin();
  let leads: Lead[] = [];
  let sites: Site[] = [];
  let businessName = "Your Business";
  let errorMessage: string | null = null;

  if (!supabase) {
    errorMessage = "Supabase is not configured.";
  } else {
    const { data: business } = await supabase
      .from("businesses")
      .select("name")
      .eq("id", session.businessId)
      .maybeSingle();

    businessName = business?.name || businessName;

    const leadsResult = await supabase
      .from("seller_leads")
      .select("id, created_at, name, phone, email, property_address, property_city, timeline, situation, status")
      .eq("business_id", session.businessId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (leadsResult.error) errorMessage = leadsResult.error.message;
    leads = (leadsResult.data || []) as Lead[];

    const sitesResult = await supabase
      .from("widget_sites")
      .select("site_id, site_name, domain, is_active")
      .eq("business_id", session.businessId)
      .order("created_at", { ascending: false });

    sites = (sitesResult.data || []) as Site[];
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold text-navy">{businessName}</h1>
            <p className="text-sm text-slate-500">Client dashboard</p>
          </div>
          <form action="/api/client/logout" method="post">
            <button className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-navy">
              Log Out
            </button>
          </form>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        {errorMessage && <div className="mb-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">{errorMessage}</div>}

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <p className="text-sm font-semibold text-slate-500">Recent leads</p>
            <p className="mt-2 text-4xl font-bold text-navy">{leads.length}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <p className="text-sm font-semibold text-slate-500">Widget sites</p>
            <p className="mt-2 text-4xl font-bold text-navy">{sites.length}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <p className="text-sm font-semibold text-slate-500">Logged in as</p>
            <p className="mt-2 break-all text-lg font-bold text-navy">{session.email}</p>
          </div>
        </div>

        <div className="mb-8 rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
          <h2 className="text-xl font-bold text-navy">Widget Sites</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {sites.length === 0 && <p className="text-sm text-slate-500">No widget sites yet.</p>}
            {sites.map((site) => (
              <div key={site.site_id} className="rounded-2xl border border-slate-200 p-4">
                <div className="font-bold text-navy">{site.site_name || site.site_id}</div>
                <div className="text-sm text-slate-500">{site.domain || "No domain set"}</div>
                <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-100 p-3 text-xs text-slate-700">
{`<script src="${process.env.APP_URL || "https://cashofferchat.com"}/widget.js" data-site-id="${site.site_id}"></script>`}
                </pre>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] bg-white shadow-soft ring-1 ring-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Seller</th>
                <th className="px-5 py-4">Contact</th>
                <th className="px-5 py-4">Property</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.length === 0 && (
                <tr><td className="px-5 py-8 text-center text-slate-500" colSpan={6}>No leads yet.</td></tr>
              )}
              {leads.map((lead) => (
                <tr key={lead.id} className="align-top">
                  <td className="px-5 py-4 text-slate-500">{new Date(lead.created_at).toLocaleString()}</td>
                  <td className="px-5 py-4 font-semibold text-navy">{lead.name || "—"}</td>
                  <td className="px-5 py-4 text-slate-600"><div>{lead.phone || "—"}</div><div>{lead.email || ""}</div></td>
                  <td className="px-5 py-4 text-slate-600"><div>{lead.property_address || "—"}</div><div>{lead.property_city || ""}</div></td>
                  <td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{lead.status || "new"}</span></td>
                  <td className="px-5 py-4"><Link className="font-bold text-navy underline" href={`/client/leads/${lead.id}`}>Open</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
