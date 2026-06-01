import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminCookieName, verifyAdminSessionToken } from "@/lib/auth";
import { defaultBusinessSettings, getBusinessSettingsContext } from "@/lib/businessSettings";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { defaultCashBuyerFAQ } from "@/lib/defaultFaqKnowledge";

export const dynamic = "force-dynamic";
export const metadata = { title: "Business Settings | CashOfferChat" };

function areaLines(areas: Array<{ city: string; state: string | null; notes: string | null }>) {
  return areas.map((area) => [area.city, area.state, area.notes].filter(Boolean).join(" | ")).join("\n");
}

function referralLines(areas: Array<{ city: string; state: string | null; contact_name: string | null; contact_email: string | null; contact_phone: string | null; notes: string | null }>) {
  return areas.map((area) => [area.city, area.state, area.contact_name, area.contact_email, area.contact_phone, area.notes].filter(Boolean).join(" | ")).join("\n");
}

function criteriaLines(criteria: Array<{ label: string; notes: string | null }>) {
  return criteria.map((item) => [item.label, item.notes].filter(Boolean).join(" | ")).join("\n");
}

export default async function AdminSettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName())?.value;
  if (!verifyAdminSessionToken(token)) redirect("/admin/login");

  const params = await searchParams;
  const supabase = getSupabaseAdmin();
  const settings = supabase ? await getBusinessSettingsContext(supabase) : defaultBusinessSettings;
  const business = settings.business;
  const appUrl = (process.env.APP_URL || "https://cashofferchat.com").replace(/\/$/, "");
  const embedCode = `<script src="${appUrl}/widget.js" data-site-id="demo"></script>`;
  const qaRows = [...settings.customQA];
  while (qaRows.length < 6) qaRows.push({ trigger_question: "", answer: "" });

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold text-navy">Business Settings</h1>
            <p className="text-sm text-slate-500">Control what the AI knows and how it answers seller questions.</p>
          </div>
          <div className="flex gap-3">
            <Link className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-navy" href="/admin">Leads</Link>
            <Link className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-navy" href="/widget-demo">Widget Demo</Link>
            <form action="/api/admin/logout" method="post"><button className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-navy">Log Out</button></form>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-8">
        {!supabase && <div className="mb-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">Supabase is not configured. This page is showing default demo settings.</div>}
        {params.saved && <div className="mb-6 rounded-2xl bg-green/10 p-4 text-sm font-semibold text-navy">Settings saved. The demo chat will now reference these settings.</div>}
        {params.error && <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">Settings could not be saved: {params.error}</div>}


        <section className="mb-6 rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
          <h2 className="text-xl font-bold text-navy">Embed Code</h2>
          <p className="mt-2 text-sm text-slate-600">Copy this script into a cash home buyer website to load the CashOfferChat widget. Phase 2E uses a demo site id until multi-company accounts are added.</p>
          <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-950 p-4 text-sm text-white"><code>{embedCode}</code></pre>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link className="rounded-full bg-gold px-5 py-3 text-sm font-bold text-navy" href="/widget-demo">Preview Widget</Link>
            <a className="rounded-full border border-slate-300 px-5 py-3 text-sm font-bold text-navy" href={`${appUrl}/widget.js`} target="_blank" rel="noreferrer">Open widget.js</a>
          </div>
        </section>

        <form action="/api/admin/settings" method="post" className="space-y-6">
          <section className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-navy">Business Profile</h2>
            <p className="mt-2 text-sm text-slate-600">This information gives the AI a company-specific context.</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-700">Business name<input name="business_name" defaultValue={business.business_name || ""} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-gold" /></label>
              <label className="block text-sm font-semibold text-slate-700">Website<input name="website" defaultValue={business.website || ""} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-gold" /></label>
              <label className="block text-sm font-semibold text-slate-700">Main phone<input name="phone" defaultValue={business.phone || ""} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-gold" /></label>
              <label className="block text-sm font-semibold text-slate-700">Main email<input name="email" defaultValue={business.email || ""} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-gold" /></label>
              <label className="block text-sm font-semibold text-slate-700">Lead notification email<input name="lead_notification_email" defaultValue={business.lead_notification_email || ""} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-gold" placeholder="where new lead emails should go" /></label>
              <label className="block text-sm font-semibold text-slate-700">From email<input name="from_email" defaultValue={business.from_email || ""} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-gold" placeholder="CashOfferChat <leads@yourdomain.com>" /></label>
              <label className="block text-sm font-semibold text-slate-700 md:col-span-2">Primary market<input name="primary_market" defaultValue={business.primary_market || ""} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-gold" /></label>
              <label className="block text-sm font-semibold text-slate-700 md:col-span-2">Business description<textarea name="description" defaultValue={business.description || ""} className="mt-1 min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-gold" /></label>
              <label className="block text-sm font-semibold text-slate-700 md:col-span-2">Preferred tone<textarea name="preferred_tone" defaultValue={business.preferred_tone || ""} className="mt-1 min-h-20 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-gold" /></label>
            </div>
          </section>

          <section className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-navy">Buying Areas</h2>
            <p className="mt-2 text-sm text-slate-600">Enter one city per line. Format: City | State | Optional notes</p>
            <textarea name="service_areas" defaultValue={areaLines(settings.serviceAreas)} className="mt-4 min-h-40 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-gold" />
          </section>

          <section className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-navy">Referral Areas</h2>
            <p className="mt-2 text-sm text-slate-600">Use this for cities where the business has a referral contact. Format: City | State | Contact name | Contact email | Contact phone | Notes</p>
            <textarea name="referral_areas" defaultValue={referralLines(settings.referralAreas)} className="mt-4 min-h-40 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-gold" />
            <label className="mt-4 flex items-center gap-3 text-sm font-semibold text-slate-700"><input type="checkbox" name="disclose_referral_contacts" defaultChecked={Boolean(business.disclose_referral_contacts)} /> Allow public disclosure of referral contact details when a referral area row is also marked public later.</label>
            <p className="mt-2 text-xs text-slate-500">Phase 2B keeps referral contact details private in chat responses by default.</p>
          </section>

          <section className="grid gap-6 md:grid-cols-2">
            <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
              <h2 className="text-xl font-bold text-navy">What We Buy</h2>
              <p className="mt-2 text-sm text-slate-600">One item per line. Format: Item | Optional notes</p>
              <textarea name="will_buy" defaultValue={criteriaLines(settings.willBuy)} className="mt-4 min-h-52 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-gold" />
            </div>
            <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
              <h2 className="text-xl font-bold text-navy">What We Do Not Buy</h2>
              <p className="mt-2 text-sm text-slate-600">One item per line. Format: Item | Optional notes</p>
              <textarea name="will_not_buy" defaultValue={criteriaLines(settings.willNotBuy)} className="mt-4 min-h-52 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-gold" />
            </div>
          </section>

          <section className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-navy">Custom Q&amp;A Knowledge Base</h2>
            <p className="mt-2 text-sm text-slate-600">The AI should prioritize these custom answers when a visitor asks a matching question.</p>
            <div className="mt-5 space-y-5">
              {qaRows.map((row, index) => (
                <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <label className="block text-sm font-semibold text-slate-700">What question should I look for?<input name="qa_trigger" defaultValue={row.trigger_question} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal outline-none focus:border-gold" placeholder="Do you buy houses with tenants?" /></label>
                  <label className="mt-3 block text-sm font-semibold text-slate-700">What is your answer to that question?<textarea name="qa_answer" defaultValue={row.answer} className="mt-1 min-h-24 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal outline-none focus:border-gold" placeholder="Yes. We can review tenant-occupied properties..." /></label>
                </div>
              ))}
            </div>
          </section>


          <section className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-navy">Default FAQ Knowledge Base</h2>
            <p className="mt-2 text-sm text-slate-600">These built-in FAQs are used after your Custom Q&A answers and before generic fallback answers. Add a Custom Q&A item above if you want to override any default answer for this business.</p>
            <div className="mt-5 space-y-4">
              {defaultCashBuyerFAQ.map((item) => (
                <details key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <summary className="cursor-pointer font-bold text-navy">{item.triggerQuestion}</summary>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{item.answer}</p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{item.category}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-navy">Custom AI Instructions</h2>
            <p className="mt-2 text-sm text-slate-600">Use this for business-specific rules the AI should follow.</p>
            <textarea name="custom_instructions" defaultValue={business.custom_instructions || ""} className="mt-4 min-h-40 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-gold" />
          </section>

          <div className="sticky bottom-4 flex justify-end">
            <button className="rounded-full bg-gold px-8 py-4 font-bold text-navy shadow-soft" type="submit">Save Business Settings</button>
          </div>
        </form>
      </section>
    </main>
  );
}
