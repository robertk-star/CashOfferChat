import { SupabaseClient } from "@supabase/supabase-js";

export type SiteContext = {
  siteId: string;
  siteName: string;
  businessId: string | null;
  businessName: string | null;
  domain: string | null;
  allowedDomains: string | null;
  isActive: boolean;
};

export const defaultSiteContext: SiteContext = {
  siteId: "demo",
  siteName: "Sell My House Today Anywhere Demo",
  businessId: null,
  businessName: "Sell My House Today Anywhere",
  domain: "sellmyhousetodayanywhere.com",
  allowedDomains: "sellmyhousetodayanywhere.com\nwww.sellmyhousetodayanywhere.com\ncashofferchat.com",
  isActive: true,
};

export function cleanSiteId(value?: string | null) {
  const cleaned = String(value || "demo")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 80);
  return cleaned || "demo";
}

export function normalizeDomain(value: string) {
  return value
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .split("/")[0]
    .trim()
    .toLowerCase();
}

export function allowedDomainList(value?: string | null) {
  return String(value || "")
    .split(/\r?\n|,/)
    .map((item) => normalizeDomain(item))
    .filter(Boolean);
}

export async function getSiteContext(supabase: SupabaseClient | null, siteId?: string | null): Promise<SiteContext> {
  const cleanedSiteId = cleanSiteId(siteId);
  if (!supabase) return { ...defaultSiteContext, siteId: cleanedSiteId };

  try {
    const { data, error } = await supabase
      .from("widget_sites")
      .select("site_id, name, domain, allowed_domains, is_active, business_id, businesses(name)")
      .eq("site_id", cleanedSiteId)
      .maybeSingle();

    if (error || !data) {
      return { ...defaultSiteContext, siteId: cleanedSiteId };
    }

    const business = Array.isArray(data.businesses) ? data.businesses[0] : data.businesses;

    return {
      siteId: data.site_id || cleanedSiteId,
      siteName: data.name || defaultSiteContext.siteName,
      businessId: data.business_id || null,
      businessName: business?.name || defaultSiteContext.businessName,
      domain: data.domain || null,
      allowedDomains: data.allowed_domains || null,
      isActive: data.is_active !== false,
    };
  } catch {
    return { ...defaultSiteContext, siteId: cleanedSiteId };
  }
}
