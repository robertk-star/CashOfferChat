import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCookieName, verifyAdminSessionToken } from "@/lib/auth";
import { hashClientPassword } from "@/lib/clientAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName())?.value;
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.redirect(new URL(`/admin/clients/${id}?error=1`, request.url), { status: 303 });
  }

  const formData = await request.formData();
  const businessId = String(formData.get("business_id") || "");
  const name = String(formData.get("name") || "").trim() || null;
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const newPassword = String(formData.get("new_password") || "");
  const isActive = formData.get("is_active") === "on";

  if (!businessId || !email) {
    return NextResponse.redirect(new URL(`/admin/clients/${id}?error=1`, request.url), { status: 303 });
  }

  const updatePayload: Record<string, unknown> = {
    business_id: businessId,
    name,
    email,
    is_active: isActive,
    updated_at: new Date().toISOString(),
  };

  if (newPassword) {
    if (newPassword.length < 8) {
      return NextResponse.redirect(new URL(`/admin/clients/${id}?error=1`, request.url), { status: 303 });
    }
    updatePayload.password_hash = hashClientPassword(newPassword);
  }

  const { error } = await supabase
    .from("business_users")
    .update(updatePayload)
    .eq("id", id);

  if (error) {
    return NextResponse.redirect(new URL(`/admin/clients/${id}?error=1`, request.url), { status: 303 });
  }

  return NextResponse.redirect(new URL(`/admin/clients/${id}?saved=1`, request.url), { status: 303 });
}
