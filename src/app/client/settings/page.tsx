import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { clientCookieName, verifyClientSessionToken } from "@/lib/clientAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { loadClientSettingsData } from "@/lib/clientSettingsData";

export const dynamic = "force-dynamic";
export const metadata = { title: "Client Settings | CashOfferChat" };

export default async function ClientSettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const query = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get(clientCookieName())?.value;
  const session = verifyClientSessionToken(token);
  if (!session) redirect("/client/login");

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="rounded-2xl bg-red-50 p-4 text-red-700">Supabase is not configured.</div>
      </main>
    );
  }

  const settings = await loadClientSettingsData(supabase, session.businessId);
  const appUrl = process.env.APP_URL || "https://cashofferchat.com";

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <Link href="/client" className="text-sm font-bold text-slate-500 underline">Back to Client Dashboard</Link>
            <h1 className="mt-2 text-2xl font-bold text-navy">Client Settings</h1>
            <p className="text-sm text-slate-500">Manage your business profile, widget settings, service areas, and FAQs.</p>
          </div>
          <form action="/api/client/logout" method="post">
            <button className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-navy">Log Out</button>
          </form>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        {query.saved && <div className="mb-6 rounded-2xl bg-green-50 p-4 text-sm text-green-800">Settings saved.</div>}
        {query.error && <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">Settings could not be saved.</div>}

        <form action="/api/client/settings" method="post" className="space-y-8">
          <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-navy">Business Profile</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-700">
                Business Name
                <input name="business_name" defaultValue={settings.business.name} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Website
                <input name="website" defaultValue={settings.business.website} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Phone
                <input name="phone" defaultValue={settings.business.phone} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Business Email
                <input name="email" type="email" defaultValue={settings.business.email} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Primary Market
                <input name="primary_market" defaultValue={settings.business.primary_market} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
                Business Description
                <textarea name="description" defaultValue={settings.business.description} className="mt-1 min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-navy">Widget Branding</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-700">
                Widget Title
                <input name="widget_title" defaultValue={settings.business.widget_title} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Widget Subtitle
                <input name="widget_subtitle" defaultValue={settings.business.widget_subtitle} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Chat Bubble Text
                <input name="widget_bubble_text" defaultValue={settings.business.widget_bubble_text} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Quote Button Text
                <input name="widget_quote_button_text" defaultValue={settings.business.widget_quote_button_text} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Header Color
                <input name="widget_header_color" defaultValue={settings.business.widget_header_color} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Button Color
                <input name="widget_button_color" defaultValue={settings.business.widget_button_color} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Call Button Text
                <input name="widget_call_button_text" defaultValue={settings.business.widget_call_button_text} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                <input name="widget_show_call_button" type="checkbox" defaultChecked={settings.business.widget_show_call_button} /> Show call button
              </label>
              <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
                Success Message
                <textarea name="widget_success_message" defaultValue={settings.business.widget_success_message} className="mt-1 min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4">
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">Embed Code</h3>
              <pre className="mt-3 overflow-x-auto rounded-xl bg-white p-4 text-xs text-slate-700 ring-1 ring-slate-200">{`<script src="${appUrl}/widget.js" data-site-id="demo"></script>`}</pre>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-navy">Service Areas & Buying Rules</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-700">
                Cities / Areas You Buy In
                <textarea name="service_areas" defaultValue={settings.serviceAreasText} className="mt-1 min-h-32 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Referral Cities / Areas
                <textarea name="referral_areas" defaultValue={settings.referralAreasText} className="mt-1 min-h-32 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                What You Buy
                <textarea name="will_buy" defaultValue={settings.willBuyText} className="mt-1 min-h-32 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                What You Do Not Buy
                <textarea name="will_not_buy" defaultValue={settings.willNotBuyText} className="mt-1 min-h-32 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-navy">Lead Notifications & Domains</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-700">
                Lead Notification Email
                <input name="lead_notification_email" type="email" defaultValue={settings.business.lead_notification_email} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                From Email
                <input name="from_email" defaultValue={settings.business.from_email} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
                Allowed Domains
                <textarea name="widget_allowed_domains" defaultValue={settings.business.widget_allowed_domains} className="mt-1 min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-navy">AI Instructions</h2>
            <textarea name="custom_ai_instructions" defaultValue={settings.business.custom_ai_instructions} className="mt-6 min-h-40 w-full rounded-xl border border-slate-300 px-4 py-3" />
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-navy">Managed FAQs</h2>
            <p className="mt-2 text-sm text-slate-600">Edit the questions and answers the widget should use before default fallback answers.</p>
            <div className="mt-6 space-y-5">
              {settings.managedFaqs.map((faq, index) => (
                <div key={faq.id || index} className="rounded-2xl border border-slate-200 p-4">
                  <input type="hidden" name="faq_id" defaultValue={faq.id || ""} />
                  <input type="hidden" name="faq_enabled" defaultValue="on" />
                  <label className="block text-sm font-semibold text-slate-700">
                    Question / Trigger
                    <input name="faq_question" defaultValue={faq.question} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
                  </label>
                  <label className="mt-3 block text-sm font-semibold text-slate-700">
                    Answer
                    <textarea name="faq_answer" defaultValue={faq.answer} className="mt-1 min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3" />
                  </label>
                  <label className="mt-3 flex items-center gap-3 text-sm font-semibold text-slate-700">
                    <input name="faq_remove" type="checkbox" value={String(index)} /> Remove this FAQ
                  </label>
                </div>
              ))}
              <div className="rounded-2xl border border-dashed border-slate-300 p-4">
                <h3 className="font-bold text-navy">Add a New FAQ</h3>
                <label className="mt-3 block text-sm font-semibold text-slate-700">
                  Question / Trigger
                  <input name="new_faq_question" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
                </label>
                <label className="mt-3 block text-sm font-semibold text-slate-700">
                  Answer
                  <textarea name="new_faq_answer" className="mt-1 min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3" />
                </label>
              </div>
            </div>
          </div>

          <div className="sticky bottom-4 rounded-[2rem] bg-white p-4 shadow-soft ring-1 ring-slate-200">
            <button className="w-full rounded-full bg-gold px-7 py-4 font-bold text-navy" type="submit">
              Save Client Settings
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
