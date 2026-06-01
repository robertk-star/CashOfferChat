import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCookieName, verifyAdminSessionToken } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const allowedStatuses = new Set([
  "new",
  "contacted",
  "appointment_set",
  "offer_made",
  "under_contract",
  "closed",
  "not_interested",
  "bad_lead",
  "referral",
]);

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName())?.value;
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
  }

  const { id } = await params;
  const formData = await request.formData();
  const status = String(formData.get("status") || "new");
  const adminNotes = String(formData.get("admin_notes") || "").slice(0, 5000);
  const markContacted = String(formData.get("mark_contacted") || "") === "on";

  if (!allowedStatuses.has(status)) {
    return NextResponse.redirect(new URL(`/admin/leads/${id}?error=invalid-status`, request.url), { status: 303 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.redirect(new URL(`/admin/leads/${id}?error=supabase`, request.url), { status: 303 });
  }

  const update: Record<string, string | null> = {
    status,
    admin_notes: adminNotes || null,
  };

  if (markContacted || status === "contacted") {
    update.last_contacted_at = new Date().toISOString();
  }

  const { error } = await supabase.from("seller_leads").update(update).eq("id", id);
  if (error) {
    return NextResponse.redirect(new URL(`/admin/leads/${id}?error=update`, request.url), { status: 303 });
  }

  return NextResponse.redirect(new URL(`/admin/leads/${id}?saved=1`, request.url), { status: 303 });
}
