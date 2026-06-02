import { NextResponse } from "next/server";
import { getBusinessSettingsContext } from "@/lib/businessSettings";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function normalizeDomain(value: string) {
  return value
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .split("/")[0]
    .trim()
    .toLowerCase();
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sourceUrl = url.searchParams.get("sourceUrl") || "";
  const settings = await getBusinessSettingsContext(getSupabaseAdmin());
  const business = settings.business;

  const allowedDomains = String(business.widget_allowed_domains || "")
    .split(/\r?\n|,/)
    .map((item) => normalizeDomain(item))
    .filter(Boolean);

  let sourceDomain = "";
  try {
    sourceDomain = sourceUrl ? normalizeDomain(new URL(sourceUrl).hostname) : "";
  } catch {
    sourceDomain = "";
  }

  const isAllowedDomain = !allowedDomains.length || !sourceDomain || allowedDomains.includes(sourceDomain);

  return NextResponse.json(
    {
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
