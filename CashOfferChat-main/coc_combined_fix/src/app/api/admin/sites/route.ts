import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCookieName, verifyAdminSessionToken } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { normalizeDomain, normalizeDomainInput, slugifySiteId } from "@/lib/siteId";

function value(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function withFormValues(url: URL, formData: FormData, error: string) {
  url.searchParams.set("error", error);
  for (const key of ["business_id", "site_id", "site_name", "domain", "allowed_domains"]) {
    const formValue = value(formData, key);
    if (formValue) url.searchParams.set(key, formValue);
  }
  url.searchParams.set("is_active", formData.get("is_active") === "on" ? "true" : "false");
  return url;
}

function fail(request: Request, formData: FormData, error: string) {
  return NextResponse.redirect(withFormValues(new URL("/admin/sites", request.url), formData, error), { status: 303 });
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName())?.value;
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
  }

  const formData = await request.formData();
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return fail(request, formData, "Supabase is not configured.");
  }

  const businessId = value(formData, "business_id");
  const siteId = slugifySiteId(value(formData, "site_id"));
  const siteName = value(formData, "site_name") || siteId;
  const domain = normalizeDomain(value(formData, "domain"));
  const allowedDomains = normalizeDomainInput(value(formData, "allowed_domains")) || domain;
  const isActive = formData.get("is_active") === "on";

  if (!businessId) {
    return fail(request, formData, "Please select a business before saving the widget site.");
  }

  if (!siteId) {
    return fail(request, formData, "Please enter a Site ID before saving the widget site.");
  }

  const businessCheck = await supabase
    .from("businesses")
    .select("id, name")
    .eq("id", businessId)
    .maybeSingle();

  if (businessCheck.error) {
    return fail(request, formData, `Business lookup failed: ${businessCheck.error.message}`);
  }

  if (!businessCheck.data?.id) {
    return fail(request, formData, "The selected business could not be found. Refresh the page and choose the business again.");
  }

  const existingSite = await supabase
    .from("widget_sites")
    .select("id, site_id, name, site_name")
    .eq("site_id", siteId)
    .maybeSingle();

  if (existingSite.error) {
    return fail(request, formData, `Site ID lookup failed: ${existingSite.error.message}`);
  }

  if (existingSite.data?.id) {
    const existingLabel = existingSite.data.site_name || existingSite.data.name || existingSite.data.site_id;
    return fail(
      request,
      formData,
      `Site ID "${siteId}" already exists for "${existingLabel}". Use Open Site below to edit the existing widget site instead of adding a new one.`
    );
  }

  const { error } = await supabase.from("widget_sites").insert({
    business_id: businessId,
    site_id: siteId,
    name: siteName,
    site_name: siteName,
    domain,
    allowed_domains: allowedDomains,
    is_active: isActive,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return fail(request, formData, `Widget site could not be saved: ${error.message}`);
  }

  return NextResponse.redirect(new URL("/admin/sites?saved=1", request.url), { status: 303 });
}
