import { NextResponse } from "next/server";
import { getBusinessSettingsContext } from "@/lib/businessSettings";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getSiteContext, allowedDomainList, normalizeDomain } from "@/lib/siteContext";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sourceUrl = url.searchParams.get("sourceUrl") || "";
  const siteId = url.searchParams.get("siteId") || "demo";
  const supabase = getSupabaseAdmin();
  const settings = await getBusinessSettingsContext(supabase);
  const site = await getSiteContext(supabase, siteId);
  const business = settings.business;

  const allowedDomains = allowedDomainList(site.allowedDomains || business.widget_allowed_domains || "");

  let sourceDomain = "";
  try {
    sourceDomain = sourceUrl ? normalizeDomain(new URL(sourceUrl).hostname) : "";
  } catch {
    sourceDomain = "";
  }

  const isAllowedDomain = !allowedDomains.length || !sourceDomain || allowedDomains.includes(sourceDomain);

  return NextResponse.json(
    {
      siteId: site.siteId,
      siteName: site.siteName,
      businessId: site.businessId,
      businessName: site.businessName || business.business_name || "Sell My House Today Anywhere",
      isActive: site.isActive,
      title: business.widget_title || "Seller Intake Assistant",
      subtitle: business.widget_subtitle || "Answers questions and collects property basics",
      bubbleText: business.widget_bubble_text || "Questions? Chat with us",
      quoteButtonText: business.widget_quote_button_text || "Enter House Info for a Quote",
      successMessage: business.widget_success_message || "Thanks. Your information was received. Someone from the team can review the details and follow up.",
      primaryColor: business.widget_primary_color || "#0f2440",
      accentColor: business.widget_accent_color || "#f5b84b",
      showCallButton: business.widget_show_call_button !== false,
      callButtonText: business.widget_call_button_text || "Call Now",
      phone: business.phone || "",
      allowedDomains,
      sourceDomain,
      isAllowedDomain,
    },
    { headers: corsHeaders() }
  );
}
