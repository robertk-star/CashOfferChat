import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminCookieName, verifyAdminSessionToken } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin Dashboard | CashOfferChat" };

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

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName())?.value;
  if (!verifyAdminSessionToken(token)) redirect("/admin/login");

  const supabase = getSupabaseAdmin();
  let leads: Lead[] = [];
  let errorMessage: string | null = null;

  if (!supabase) {
    errorMessage = "Supabase is not configured. Add environment variables before testing leads.";
  } else {
    const { data, error } = await supabase
      .from("seller_leads")
      .select("id, created_at, name, phone, email, property_address, property_city, timeline, situation, status")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) errorMessage = error.message;
    leads = (data || []) as Lead[];
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold text-navy">CashOfferChat Admin</h1>
            <p className="text-sm text-slate-500">Phase 1 seller leads dashboard</p>
          </div>
          <form action="/api/admin/logout" method="post"><button className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-navy">Log Out</button></form>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        {errorMessage && <div className="mb-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">{errorMessage}</div>}
        <div className="overflow-hidden rounded-[2rem] bg-white shadow-soft ring-1 ring-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Seller</th>
                <th className="px-5 py-4">Contact</th>
                <th className="px-5 py-4">Property</th>
                <th className="px-5 py-4">Timeline</th>
                <th className="px-5 py-4">Situation</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.length === 0 && (
                <tr><td className="px-5 py-8 text-center text-slate-500" colSpan={7}>No leads yet.</td></tr>
              )}
              {leads.map((lead) => (
                <tr key={lead.id} className="align-top">
                  <td className="px-5 py-4 text-slate-500">{new Date(lead.created_at).toLocaleString()}</td>
                  <td className="px-5 py-4 font-semibold text-navy">{lead.name || "—"}</td>
                  <td className="px-5 py-4 text-slate-600"><div>{lead.phone || "—"}</div><div>{lead.email || ""}</div></td>
                  <td className="px-5 py-4 text-slate-600"><div>{lead.property_address || "—"}</div><div>{lead.property_city || ""}</div></td>
                  <td className="px-5 py-4 text-slate-600">{lead.timeline || "—"}</td>
                  <td className="px-5 py-4 text-slate-600">{lead.situation || "—"}</td>
                  <td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{lead.status || "new"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
