import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCookieName, verifyAdminSessionToken } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { cleanSiteId } from "@/lib/siteContext";

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "business";
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName())?.value;
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.redirect(new URL("/admin/sites?error=supabase", request.url), { status: 303 });
  }

  const formData = await request.formData();
  const siteId = cleanSiteId(String(formData.get("site_id") || "demo"));
  const siteName = String(formData.get("name") || siteId).trim();
  const businessName = String(formData.get("business_name") || siteName).trim();
  const domain = String(formData.get("domain") || "").trim() || null;
  const allowedDomains = String(formData.get("allowed_domains") || "").trim() || domain;
  const isActive = formData.get("is_active") === "on";
  const slug = slugify(businessName);

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .upsert({ name: businessName, slug, status: "active", updated_at: new Date().toISOString() }, { onConflict: "slug" })
    .select("id")
    .single();

  if (businessError || !business?.id) {
    return NextResponse.redirect(new URL(`/admin/sites?error=${encodeURIComponent(businessError?.message || "Business could not be saved")}`, request.url), { status: 303 });
  }

  const { error: siteError } = await supabase
    .from("widget_sites")
    .upsert({
      site_id: siteId,
      name: siteName,
      business_id: business.id,
      domain,
      allowed_domains: allowedDomains,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    }, { onConflict: "site_id" });

  if (siteError) {
    return NextResponse.redirect(new URL(`/admin/sites?error=${encodeURIComponent(siteError.message)}`, request.url), { status: 303 });
  }

  return NextResponse.redirect(new URL("/admin/sites?saved=1", request.url), { status: 303 });
}
