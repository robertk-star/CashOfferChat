import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCookieName, verifyAdminSessionToken } from "@/lib/auth";
import { hashClientPassword } from "@/lib/clientAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { normalizeDomain, normalizeDomainInput, normalizeWebsite, parseLines, slugifySiteId } from "@/lib/siteId";

function value(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function detailText(error: unknown) {
  if (!error || typeof error !== "object") return "";
  const candidate = error as { message?: string; details?: string; hint?: string; code?: string };
  return [candidate.message, candidate.details, candidate.hint, candidate.code].filter(Boolean).join(" | ").slice(0, 500);
}

function fail(request: Request, code: string, error?: unknown) {
  const detail = detailText(error);
  const suffix = detail ? `&detail=${encodeURIComponent(detail)}` : "";
  return NextResponse.redirect(new URL(`/admin/onboarding?error=${encodeURIComponent(code)}${suffix}`, request.url), { status: 303 });
}

async function insertNamedRows(supabase: any, table: string, businessId: string, lines: string[]) {
  if (lines.length === 0) return;
  await supabase.from(table).insert(lines.map((name) => ({ business_id: businessId, name })));
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName())?.value;
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return fail(request, "supabase_not_configured");

  const formData = await request.formData();
  const businessName = value(formData, "business_name");
  const siteId = slugifySiteId(value(formData, "site_id"));
  const now = new Date().toISOString();

  if (!businessName || !siteId) return fail(request, "missing_required");

  const existingSite = await supabase.from("widget_sites").select("id").eq("site_id", siteId).maybeSingle();
  if (existingSite.data?.id) return fail(request, "duplicate_site_id");

  const rawWebsite = value(formData, "website");
  const website = normalizeWebsite(rawWebsite);
  const phone = value(formData, "phone");
  const email = value(formData, "email");
  const primaryMarket = value(formData, "primary_market");
  const description = value(formData, "description");

  let domain = normalizeDomain(value(formData, "domain"));
  if (!domain && rawWebsite) domain = normalizeDomain(rawWebsite);

  let allowedDomains = normalizeDomainInput(value(formData, "allowed_domains"));
  if (!allowedDomains && domain) allowedDomains = domain;

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .insert({
      name: businessName,
      website,
      phone,
      email,
      primary_market: primaryMarket,
      description,
      is_active: true,
      updated_at: now,
    })
    .select("id")
    .single();

  if (businessError || !business?.id) return fail(request, "business_create_failed", businessError);

  const businessId = business.id;

  const { error: siteError } = await supabase.from("widget_sites").insert({
    business_id: businessId,
    site_id: siteId,
    site_name: value(formData, "site_name") || `${businessName} Widget`,
    domain,
    allowed_domains: allowedDomains,
    is_active: true,
    updated_at: now,
  });

  if (siteError) return fail(request, "site_create_failed", siteError);

  const { error: settingsError } = await supabase.from("business_settings").insert({
    business_id: businessId,
    business_name: businessName,
    website,
    phone,
    email,
    primary_market: primaryMarket,
    business_description: description,
    custom_ai_instructions:
      "Do not make offers over chat. Answer questions helpfully, do not provide legal/tax/financial advice, and invite the seller to enter house information for review when appropriate.",
    lead_notification_email: value(formData, "lead_notification_email"),
    widget_title: value(formData, "widget_title") || "Seller Intake Assistant",
    widget_subtitle: value(formData, "widget_subtitle") || "Answers questions and collects property basics",
    widget_bubble_text: "Questions? Chat with us",
    widget_quote_button_text: value(formData, "widget_quote_button_text") || "Enter House Info for a Quote",
    widget_success_message:
      "Thanks. Your information was received. Someone from the team can review the details and follow up.",
    widget_header_color: "#0f172a",
    widget_button_color: "#f5b51b",
    widget_show_call_button: true,
    widget_call_button_text: "Call Now",
    widget_allowed_domains: allowedDomains,
    updated_at: now,
  });

  if (settingsError) return fail(request, "settings_create_failed", settingsError);

  await insertNamedRows(supabase, "service_areas", businessId, parseLines(value(formData, "service_areas")));
  await insertNamedRows(supabase, "referral_areas", businessId, parseLines(value(formData, "referral_areas")));

  const willBuy = parseLines(value(formData, "will_buy")).map((label) => ({ business_id: businessId, type: "will_buy", label }));
  const willNotBuy = parseLines(value(formData, "will_not_buy")).map((label) => ({ business_id: businessId, type: "will_not_buy", label }));
  if (willBuy.length || willNotBuy.length) await supabase.from("property_buying_criteria").insert([...willBuy, ...willNotBuy]);

  if (formData.get("create_client_user") === "on") {
    const clientEmail = value(formData, "client_email").toLowerCase();
    const clientPassword = value(formData, "client_password");
    if (clientEmail && clientPassword.length >= 8) {
      await supabase.from("business_users").upsert(
        {
          business_id: businessId,
          email: clientEmail,
          name: value(formData, "client_name") || null,
          role: "owner",
          password_hash: hashClientPassword(clientPassword),
          is_active: true,
          updated_at: now,
        },
        { onConflict: "email" }
      );
    }
  }

  return NextResponse.redirect(new URL(`/admin/onboarding?saved=1&siteId=${encodeURIComponent(siteId)}`, request.url), { status: 303 });
}
