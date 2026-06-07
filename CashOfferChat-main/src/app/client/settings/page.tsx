import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { clientCookieName, verifyClientSessionToken } from "@/lib/clientAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Client Settings | CashOfferChat" };

type ClientSettingsSearchParams = {
  saved?: string;
  error?: string;
};

function displayMessage(value?: string) {
  if (!value) return null;
  if (value === "1") return "Settings saved.";
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export default async function ClientSettingsPage({ searchParams }: { searchParams: Promise<ClientSettingsSearchParams> }) {
  const query = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get(clientCookieName())?.value;
  const session = verifyClientSessionToken(token);
  if (!session) redirect("/client/login");

  const supabase = getSupabaseAdmin();
  let settings: any = {};
  let business: any = {};
  let errorMessage: string | null = displayMessage(query.error);
  const savedMessage = displayMessage(query.saved);

  if (!supabase) {
    errorMessage = "Supabase is not configured.";
  } else {
    const br = await supabase.from("businesses").select("*").eq("id", session.businessId).maybeSingle();
    const sr = await supabase.from("business_settings").select("*").eq("business_id", session.businessId).order("updated_at", { ascending: false }).limit(1);
    business = br.data || {};
    settings = Array.isArray(sr.data) ? sr.data[0] || {} : sr.data || {};

    if (br.error) errorMessage = `Business profile could not be loaded: ${br.error.message}`;
    else if (sr.error) errorMessage = `Widget settings could not be loaded: ${sr.error.message}`;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div>
            <Link href="/client" className="text-sm font-bold text-slate-500 underline">Back to Client Dashboard</Link>
            <h1 className="mt-2 text-2xl font-bold text-navy">Client Settings</h1>
          </div>
          <form action="/api/client/logout" method="post">
            <button className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-navy">Log Out</button>
          </form>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-8">
        {savedMessage && <div className="mb-6 rounded-2xl bg-green-50 p-4 text-sm text-green-800">{savedMessage}</div>}
        {errorMessage && <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{errorMessage}</div>}

        <form action="/api/client/settings" method="post" className="space-y-6">
          <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-navy">Business Profile</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-700">
                Business Name
                <input name="business_name" required defaultValue={business.name || settings.business_name || ""} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Phone
                <input name="phone" defaultValue={business.phone || settings.phone || ""} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Website
                <input name="website" defaultValue={business.website || settings.website || ""} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Primary Market
                <input name="primary_market" defaultValue={business.primary_market || settings.primary_market || ""} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-navy">Widget</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-700">
                Widget Title
                <input name="widget_title" defaultValue={settings.widget_title || "Seller Intake Assistant"} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Quote Button Text
                <input name="widget_quote_button_text" defaultValue={settings.widget_quote_button_text || "Enter House Info for a Quote"} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Call Button Text
                <input name="widget_call_button_text" defaultValue={settings.widget_call_button_text || "Call Now"} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700 md:col-span-2">
                <input name="widget_show_call_button" type="checkbox" defaultChecked={settings.widget_show_call_button !== false} className="mt-1" />
                <span>
                  Show phone number / call button in the widget
                  <span className="block pt-1 text-xs font-normal text-slate-500">Turn this off if you do not want visitors to see the business phone number inside the widget.</span>
                </span>
              </label>
            </div>
          </div>

          <button className="w-full rounded-full bg-gold px-7 py-4 font-bold text-navy" type="submit">Save Client Settings</button>
        </form>
      </section>
    </main>
  );
}
