import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type WidgetSite = {
  id: string;
  site_id: string;
  business_id: string | null;
  name?: string | null;
  site_name?: string | null;
  domain?: string | null;
  allowed_domains?: string | null;
  is_active?: boolean | null;
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
  };
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

function normalizeDomain(value?: string | null) {
  if (!value) return "";
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    .split(":")[0]
    .trim();
}

function splitDomains(value?: string | null) {
  return String(value || "")
    .split(/[\n,]+/)
    .map(normalizeDomain)
    .filter(Boolean);
}

function getRequestDomain(request: Request) {
  const url = new URL(request.url);
  const explicitDomain = url.searchParams.get("domain") || url.searchParams.get("host");
  if (explicitDomain) return normalizeDomain(explicitDomain);

  const explicitUrl = url.searchParams.get("url") || "";
  if (explicitUrl) {
    try {
      return normalizeDomain(new URL(explicitUrl).hostname);
    } catch {
      return normalizeDomain(explicitUrl);
    }
  }

  const origin = request.headers.get("origin") || request.headers.get("referer") || "";
  try {
    return normalizeDomain(new URL(origin).hostname);
  } catch {
    return normalizeDomain(origin);
  }
}

function isAllowedDomain(site: WidgetSite, requestDomain: string) {
  const allowedDomains = splitDomains(site.allowed_domains);
  const primaryDomain = normalizeDomain(site.domain);
  const configuredDomains = [...allowedDomains, primaryDomain].filter(Boolean);

  if (!requestDomain || configuredDomains.length === 0) return true;

  return configuredDomains.some((domain) => requestDomain === domain || requestDomain.endsWith(`.${domain}`));
}

function defaultSettings(siteId: string) {
  return {
    siteId,
    businessId: null,
    businessName: "CashOfferChat",
    businessPhone: "",
    widgetTitle: "Seller Intake Assistant",
    widgetSubtitle: "Answers questions and collects property basics",
    widgetBubbleText: "Questions? Chat with us",
    widgetQuoteButtonText: "Enter House Info for a Quote",
    widgetSuccessMessage: "Thanks. Your information was received. Someone from the team can review the details and follow up.",
    widgetHeaderColor: "#0f172a",
    widgetButtonColor: "#f5b51b",
    widgetShowCallButton: true,
    widgetCallButtonText: "Call Now",
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const siteId = String(url.searchParams.get("siteId") || "demo").trim() || "demo";
  const fallback = defaultSettings(siteId);
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return NextResponse.json({ ok: true, settings: fallback }, { headers: corsHeaders() });
  }

  const requestDomain = getRequestDomain(request);

  const siteSelect = "id, site_id, business_id, name, site_name, domain, allowed_domains, is_active";
  const bySiteId = await supabase
    .from("widget_sites")
    .select(siteSelect)
    .eq("site_id", siteId)
    .maybeSingle();

  if (bySiteId.error) {
    return NextResponse.json(
      { error: bySiteId.error.message },
      { status: 500, headers: corsHeaders() },
    );
  }

  let site = bySiteId.data as WidgetSite | null;

  if (!site && requestDomain) {
    const byDomain = await supabase
      .from("widget_sites")
      .select(siteSelect)
      .or(`domain.ilike.%${requestDomain}%,allowed_domains.ilike.%${requestDomain}%`)
      .limit(1);

    if (!byDomain.error && byDomain.data && byDomain.data.length > 0) {
      site = byDomain.data[0] as WidgetSite;
    }
  }

  if (!site) {
    return NextResponse.json({ ok: true, settings: fallback }, { headers: corsHeaders() });
  }

  if (site.is_active === false) {
    return NextResponse.json(
      { error: "Widget site is not active" },
      { status: 403, headers: corsHeaders() }
    );
  }

  if (!isAllowedDomain(site as WidgetSite, requestDomain)) {
    return NextResponse.json(
      { error: "This domain is not allowed for this widget site" },
      { status: 403, headers: corsHeaders() }
    );
  }

  let business: any = null;
  let settings: any = null;

  if (site.business_id) {
    const [businessResult, settingsResult] = await Promise.all([
      supabase.from("businesses").select("id, name, phone, email, website, primary_market").eq("id", site.business_id).maybeSingle(),
      supabase.from("business_settings").select("*").eq("business_id", site.business_id).maybeSingle(),
    ]);

    business = businessResult.data || null;
    settings = settingsResult.data || null;
  }

  const mergedSettings = {
    ...fallback,
    siteId: site.site_id,
    businessId: site.business_id || null,
    siteName: site.site_name || site.name || site.site_id,
    businessName: settings?.business_name || business?.name || fallback.businessName,
    businessPhone: settings?.phone || business?.phone || fallback.businessPhone,
    phone: settings?.phone || business?.phone || "",
    widgetTitle: settings?.widget_title || fallback.widgetTitle,
    widgetSubtitle: settings?.widget_subtitle || fallback.widgetSubtitle,
    widgetBubbleText: settings?.widget_bubble_text || fallback.widgetBubbleText,
    widgetQuoteButtonText: settings?.widget_quote_button_text || fallback.widgetQuoteButtonText,
    widgetSuccessMessage: settings?.widget_success_message || fallback.widgetSuccessMessage,
    widgetHeaderColor: settings?.widget_header_color || fallback.widgetHeaderColor,
    widgetButtonColor: settings?.widget_button_color || fallback.widgetButtonColor,
    widgetShowCallButton: settings?.widget_show_call_button ?? fallback.widgetShowCallButton,
    widgetCallButtonText: settings?.widget_call_button_text || fallback.widgetCallButtonText,
  };

  return NextResponse.json(
    { ok: true, site: { id: site.id, siteId: site.site_id, businessId: site.business_id }, settings: mergedSettings },
    { headers: corsHeaders() }
  );
}
