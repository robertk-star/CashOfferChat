import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { clientCookieName, verifyClientSessionToken } from "@/lib/clientAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Client Dashboard | CashOfferChat" };

export default async function ClientDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(clientCookieName())?.value;
  const session = verifyClientSessionToken(token);
  if (!session) redirect("/client/login");

  const supabase = getSupabaseAdmin();
  let businessName = "Your Business";
  let leads: any[] = [];
  let sites: any[] = [];
  let errorMessage: string | null = null;

  if (!supabase) errorMessage = "Supabase is not configured.";
  else {
    const br = await supabase.from("businesses").select("name").eq("id", session.businessId).maybeSingle();
    businessName = br.data?.name || businessName;
    const lr = await supabase.from("seller_leads").select("*").eq("business_id", session.businessId).order("created_at", { ascending: false }).limit(50);
    const sr = await supabase.from("widget_sites").select("*").eq("business_id", session.businessId).order("created_at", { ascending: false });
    leads = lr.data || [];
    sites = sr.data || [];
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5"><div><h1 className="text-2xl font-bold text-navy">{businessName}</h1><p className="text-sm text-slate-500">Client dashboard</p></div><div className="flex gap-3"><Link className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-navy" href="/client/settings">Settings</Link><Link className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-navy" href="/client/account">Account</Link><form action="/api/client/logout" method="post"><button className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-navy">Log Out</button></form></div></div></header>
      <section className="mx-auto max-w-7xl px-6 py-8">
        {errorMessage && <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{errorMessage}</div>}
        <div className="mb-8 grid gap-4 md:grid-cols-2"><div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-slate-200"><p className="text-sm font-semibold text-slate-500">Leads</p><p className="mt-2 text-4xl font-bold text-navy">{leads.length}</p></div><div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-slate-200"><p className="text-sm font-semibold text-slate-500">Widget Sites</p><p className="mt-2 text-4xl font-bold text-navy">{sites.length}</p></div></div>
        <div className="overflow-hidden rounded-[2rem] bg-white shadow-soft ring-1 ring-slate-200"><table className="min-w-full divide-y divide-slate-200 text-sm"><thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-4">Date</th><th className="px-5 py-4">Seller</th><th className="px-5 py-4">Contact</th><th className="px-5 py-4">Property</th><th className="px-5 py-4">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{leads.length===0 && <tr><td className="px-5 py-8 text-center text-slate-500" colSpan={5}>No leads yet.</td></tr>}{leads.map((lead)=><tr key={lead.id}><td className="px-5 py-4 text-slate-500">{new Date(lead.created_at).toLocaleString()}</td><td className="px-5 py-4 font-semibold text-navy">{lead.name || "—"}</td><td className="px-5 py-4 text-slate-600">{lead.phone || "—"}</td><td className="px-5 py-4 text-slate-600">{lead.property_city || lead.property_address || "—"}</td><td className="px-5 py-4 text-slate-600">{lead.status || "new"}</td></tr>)}</tbody></table></div>
      </section>
    </main>
  );
}
