import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminCookieName, verifyAdminSessionToken } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Onboard Business | CashOfferChat" };

function onboardingErrorMessage(code?: string, detail?: string) {
  const details = detail ? ` Details: ${detail}` : "";
  switch (code) {
    case "missing_required":
      return "Business Name and Site ID are required.";
    case "duplicate_site_id":
      return "That Site ID already exists. Please choose a unique Site ID.";
    case "business_create_failed":
      return `The business record could not be created.${details}`;
    case "site_create_failed":
      return `The widget site could not be created. Check the Site ID and domain fields.${details}`;
    case "settings_create_failed":
      return `The business settings record could not be created.${details}`;
    case "client_login_missing_required":
      return "Client Email and Temporary Password are required when Create client login is checked.";
    case "client_user_create_failed":
      return `The client login could not be created.${details}`;
    case "service_areas_create_failed":
    case "referral_areas_create_failed":
    case "criteria_create_failed":
      return `The business was partly created, but one of the business rules could not be saved.${details}`;
    case "supabase_not_configured":
      return "Supabase is not configured. Check the Vercel Supabase environment variables.";
    default:
      return `Business could not be onboarded. Make sure required fields are filled and the Site ID is unique.${details}`;
  }
}

export default async function AdminOnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; recovered?: string; error?: string; detail?: string; siteId?: string }>;
}) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName())?.value;
  if (!verifyAdminSessionToken(token)) redirect("/admin/login");

  const embedCode = params.siteId ? buildWidgetEmbedCode(params.siteId) : "";

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <Link href="/admin" className="text-sm font-bold text-slate-500 underline">Back to Admin</Link>
            <h1 className="mt-2 text-2xl font-bold text-navy">Onboard New Business</h1>
            <p className="text-sm text-slate-500">Create the business, widget site, settings, and optional client login in one flow.</p>
          </div>
          <form action="/api/admin/logout" method="post">
            <button className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-navy">Log Out</button>
          </form>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        {params.saved && (
          <div className="mb-6 rounded-2xl bg-green-50 p-4 text-sm text-green-800">
            Business onboarded successfully.
            {embedCode && (
              <div className="mt-4">
                <div className="font-bold">Embed code:</div>
                <pre className="mt-2 overflow-x-auto rounded-xl bg-white p-4 text-xs text-slate-700 ring-1 ring-green-200">{embedCode}</pre>
              </div>
            )}
          </div>
        )}

        {params.recovered && (
          <div className="mb-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
            That Site ID already exists, so onboarding was recovered instead of creating a duplicate. Use the existing widget site below or open Widget Sites to edit it.
            {embedCode && (
              <div className="mt-4">
                <div className="font-bold">Existing embed code:</div>
                <pre className="mt-2 overflow-x-auto rounded-xl bg-white p-4 text-xs text-slate-700 ring-1 ring-amber-200">{embedCode}</pre>
              </div>
            )}
            <div className="mt-4">
              <Link className="rounded-full bg-navy px-5 py-2 text-sm font-bold text-white" href="/admin/sites">
                Open Widget Sites
              </Link>
            </div>
          </div>
        )}

        {params.error && (
          <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
            {onboardingErrorMessage(params.error, params.detail)}
          </div>
        )}

        <form action="/api/admin/onboarding" method="post" className="space-y-8">
          <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-navy">Business Profile</h2>
            <p className="mt-2 text-sm text-slate-500">Required fields are marked with *.</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-700">Business Name *<input name="business_name" required placeholder="Sell My House Today Anywhere" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" /></label>
              <label className="block text-sm font-semibold text-slate-700">Website<input name="website" placeholder="sellmyhousetodayanywhere.com" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" /><span className="mt-1 block text-xs text-slate-500">Optional. You can enter the domain with or without https://.</span></label>
              <label className="block text-sm font-semibold text-slate-700">Phone<input name="phone" placeholder="972-555-0100" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" /></label>
              <label className="block text-sm font-semibold text-slate-700">Business Email<input name="email" type="email" placeholder="owner@example.com" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" /></label>
              <label className="block text-sm font-semibold text-slate-700">Primary Market<input name="primary_market" placeholder="Plano, Texas and nearby North Texas areas" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" /></label>
              <label className="block text-sm font-semibold text-slate-700 md:col-span-2">Business Description<textarea name="description" placeholder="Local cash home buyer that reviews houses as-is." className="mt-1 min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3" /></label>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-navy">Widget Site</h2>
            <p className="mt-2 text-sm text-slate-500">Required fields are marked with *.</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-700">Site ID *<input name="site_id" required placeholder="plano-demo" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" /><span className="mt-1 block text-xs text-slate-500">Required. Use lowercase letters, numbers, and hyphens. This becomes the widget data-site-id.</span></label>
              <label className="block text-sm font-semibold text-slate-700">Site Name<input name="site_name" placeholder="Plano Demo Site" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" /></label>
              <label className="block text-sm font-semibold text-slate-700">Primary Domain<input name="domain" placeholder="sellmyhousetodayanywhere.com" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" /><span className="mt-1 block text-xs text-slate-500">Optional. If blank, this can be inferred from the website.</span></label>
              <label className="block text-sm font-semibold text-slate-700 md:col-span-2">Allowed Domains<textarea name="allowed_domains" placeholder={"sellmyhousetodayanywhere.com\nwww.sellmyhousetodayanywhere.com"} className="mt-1 min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3" /><span className="mt-1 block text-xs text-slate-500">Optional. If blank, the primary domain will be used.</span></label>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-navy">Business Rules</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-700">Cities / Areas They Buy In<textarea name="service_areas" placeholder={"Plano\nFrisco\nMcKinney\nAllen"} className="mt-1 min-h-32 w-full rounded-xl border border-slate-300 px-4 py-3" /></label>
              <label className="block text-sm font-semibold text-slate-700">Referral Areas<textarea name="referral_areas" placeholder={"Dallas\nFort Worth"} className="mt-1 min-h-32 w-full rounded-xl border border-slate-300 px-4 py-3" /></label>
              <label className="block text-sm font-semibold text-slate-700">What They Buy<textarea name="will_buy" placeholder={"Single-family homes\nInherited houses\nTenant-occupied houses\nHouses needing repairs"} className="mt-1 min-h-32 w-full rounded-xl border border-slate-300 px-4 py-3" /></label>
              <label className="block text-sm font-semibold text-slate-700">What They Do Not Buy<textarea name="will_not_buy" placeholder={"Raw land\nLarge commercial buildings"} className="mt-1 min-h-32 w-full rounded-xl border border-slate-300 px-4 py-3" /></label>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-navy">Widget Branding</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-700">Widget Title<input name="widget_title" defaultValue="Seller Intake Assistant" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" /></label>
              <label className="block text-sm font-semibold text-slate-700">Widget Subtitle<input name="widget_subtitle" defaultValue="Answers questions and collects property basics" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" /></label>
              <label className="block text-sm font-semibold text-slate-700">Quote Button Text<input name="widget_quote_button_text" defaultValue="Enter House Info for a Quote" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" /></label>
              <label className="block text-sm font-semibold text-slate-700">Lead Notification Email<input name="lead_notification_email" type="email" placeholder="leads@example.com" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" /></label>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-navy">Optional Client Login</h2>
            <p className="mt-2 text-sm text-slate-600">If Create client login is checked, Client Email and Temporary Password are required.</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-700">Client Name<input name="client_name" placeholder="Business Owner" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" /></label>
              <label className="block text-sm font-semibold text-slate-700">Client Email * if creating login<input name="client_email" type="email" placeholder="owner@example.com" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" /></label>
              <label className="block text-sm font-semibold text-slate-700">Temporary Password * if creating login<input name="client_password" type="password" minLength={8} placeholder="At least 8 characters" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" /></label>
              <label className="flex items-center gap-3 text-sm font-semibold text-slate-700"><input name="create_client_user" type="checkbox" /> Create client login</label>
            </div>
          </div>

          <div className="sticky bottom-4 rounded-[2rem] bg-white p-4 shadow-soft ring-1 ring-slate-200">
            <button className="w-full rounded-full bg-gold px-7 py-4 font-bold text-navy" type="submit">Create Business + Widget Site</button>
          </div>
        </form>
      </section>
    </main>
  );
}
