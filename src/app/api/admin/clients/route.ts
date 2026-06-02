import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCookieName, verifyAdminSessionToken } from "@/lib/auth";
import { hashClientPassword } from "@/lib/clientAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName())?.value;
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.redirect(new URL("/admin/clients?error=1", request.url), { status: 303 });
  }

  const formData = await request.formData();
  const businessId = String(formData.get("business_id") || "");
  const name = String(formData.get("name") || "").trim() || null;
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const isActive = formData.get("is_active") === "on";

  if (!businessId || !email || !password) {
    return NextResponse.redirect(new URL("/admin/clients?error=1", request.url), { status: 303 });
  }

  const passwordHash = hashClientPassword(password);

  const { error } = await supabase
    .from("business_users")
    .upsert(
      {
        business_id: businessId,
        name,
        email,
        role: "owner",
        password_hash: passwordHash,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email" }
    );

  if (error) {
    return NextResponse.redirect(new URL("/admin/clients?error=1", request.url), { status: 303 });
  }

  return NextResponse.redirect(new URL("/admin/clients?saved=1", request.url), { status: 303 });
}
