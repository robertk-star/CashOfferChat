import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminCookieName, verifyAdminSessionToken } from "@/lib/auth";
import { defaultBusinessSettings, getBusinessSettingsContext } from "@/lib/businessSettings";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { defaultCashBuyerFAQ } from "@/lib/defaultFaqKnowledge";
import { ManagedFAQEditor } from "@/components/ManagedFAQEditor";

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

function managedFaqRows(settings: Awaited<ReturnType<typeof getBusinessSettingsContext>>) {
  const customRows = settings.customQA.map((item) => ({
    trigger_question: item.trigger_question,
    answer: item.answer,
  }));

  if (settings.business.use_custom_faq_knowledge_base) {
    return customRows;
  }

  const rowsByQuestion = new Map<string, { trigger_question: string; answer: string }>();
  for (const item of defaultCashBuyerFAQ) {
    rowsByQuestion.set(item.triggerQuestion.toLowerCase(), {
      trigger_question: item.triggerQuestion,
      answer: item.answer,
    });
  }
  for (const row of customRows) {
    rowsByQuestion.set(row.trigger_question.toLowerCase(), row);
  }
  return Array.from(rowsByQuestion.values());
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
  const widgetTitle = business.widget_title || "Seller Intake Assistant";
  const widgetSubtitle = business.widget_subtitle || "Answers questions and collects property basics";
  const widgetBubbleText = business.widget_bubble_text || "Questions? Chat with us";
  const widgetQuoteButtonText = business.widget_quote_button_text || "Enter House Info for a Quote";
  const widgetSuccessMessage = business.widget_success_message || "Thanks. Your information was received. Someone from the team can review the details and follow up.";
  const widgetPrimaryColor = business.widget_primary_color || "#0f2440";
  const widgetAccentColor = business.widget_accent_color || "#f5b84b";
  const widgetShowCallButton = business.widget_show_call_button !== false;
  const widgetCallButtonText = business.widget_call_button_text || "Call Now";
  const widgetAllowedDomains = business.widget_allowed_domains || "sellmyhousetodayanywhere.com\nwww.sellmyhousetodayanywhere.com\ncashofferchat.com";
  const faqRows = managedFaqRows(settings);
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
          <p className="mt-2 text-sm text-slate-600">Copy this script into a cash home buyer website to load the CashOfferChat widget. Paste it before the closing <code>&lt;/body&gt;</code> tag. The widget pulls branding and CTA settings from this page.</p>
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
            <h2 className="text-xl font-bold text-navy">Widget Branding & CTA Settings</h2>
            <p className="mt-2 text-sm text-slate-600">Customize how the embedded widget appears on the demo site and future customer sites.</p>
            <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-semibold text-slate-700">Widget title<input name="widget_title" defaultValue={widgetTitle} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-gold" /></label>
                <label className="block text-sm font-semibold text-slate-700">Widget subtitle<input name="widget_subtitle" defaultValue={widgetSubtitle} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-gold" /></label>
                <label className="block text-sm font-semibold text-slate-700">Bubble text<input name="widget_bubble_text" defaultValue={widgetBubbleText} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-gold" /></label>
                <label className="block text-sm font-semibold text-slate-700">Quote button text<input name="widget_quote_button_text" defaultValue={widgetQuoteButtonText} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-gold" /></label>
                <label className="block text-sm font-semibold text-slate-700">Header color<input name="widget_primary_color" type="color" defaultValue={widgetPrimaryColor} className="mt-1 h-12 w-full rounded-xl border border-slate-300 px-2 py-2 font-normal outline-none focus:border-gold" /></label>
                <label className="block text-sm font-semibold text-slate-700">Button color<input name="widget_accent_color" type="color" defaultValue={widgetAccentColor} className="mt-1 h-12 w-full rounded-xl border border-slate-300 px-2 py-2 font-normal outline-none focus:border-gold" /></label>
                <label className="block text-sm font-semibold text-slate-700">Call button text<input name="widget_call_button_text" defaultValue={widgetCallButtonText} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-gold" /></label>
                <label className="mt-7 flex items-center gap-3 text-sm font-semibold text-slate-700"><input type="checkbox" name="widget_show_call_button" defaultChecked={widgetShowCallButton} /> Show call button in widget</label>
                <label className="block text-sm font-semibold text-slate-700 md:col-span-2">Success message<textarea name="widget_success_message" defaultValue={widgetSuccessMessage} className="mt-1 min-h-20 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-gold" /></label>
                <label className="block text-sm font-semibold text-slate-700 md:col-span-2">Allowed demo/customer domains<textarea name="widget_allowed_domains" defaultValue={widgetAllowedDomains} className="mt-1 min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-gold" /></label>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                <p className="mb-3 text-sm font-bold text-navy">Widget Preview</p>
                <div className="overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-slate-200">
                  <div className="p-4 text-white" style={{ backgroundColor: widgetPrimaryColor }}>
                    <p className="font-extrabold">{widgetTitle}</p>
                    <p className="text-xs opacity-75">{widgetSubtitle}</p>
                  </div>
                  <div className="space-y-3 p-4">
                    <button type="button" className="w-full rounded-full px-4 py-3 text-sm font-black text-navy" style={{ backgroundColor: widgetAccentColor }}>{widgetQuoteButtonText}</button>
                    {widgetShowCallButton && business.phone && <a className="block rounded-full border border-slate-300 px-4 py-3 text-center text-sm font-bold text-navy" href={`tel:${business.phone}`}>{widgetCallButtonText}: {business.phone}</a>}
                    <div className="rounded-2xl border border-slate-200 p-3 text-sm text-slate-600">I can answer questions about selling a house as-is for cash, or help collect house information for a quote.</div>
                    <p className="text-xs text-slate-500">Bubble: {widgetBubbleText}</p>
                  </div>
                </div>
              </div>
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
            <h2 className="text-xl font-bold text-navy">FAQ Knowledge Base</h2>
            <p className="mt-2 text-sm text-slate-600">
              Add new FAQs in the single box below. Once added, they move into the managed FAQ list where every item can be edited or removed.
            </p>
            <ManagedFAQEditor initialRows={faqRows} />
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
