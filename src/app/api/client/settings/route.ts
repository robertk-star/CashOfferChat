import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clientCookieName, verifyClientSessionToken } from "@/lib/clientAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function value(formData: FormData, key: string) { return String(formData.get(key) || "").trim(); }

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(clientCookieName())?.value;
  const session = verifyClientSessionToken(token);
  if (!session) return NextResponse.redirect(new URL("/client/login", request.url), { status: 303 });

  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.redirect(new URL("/client/settings?error=1", request.url), { status: 303 });

  const formData = await request.formData();
  await supabase.from("businesses").update({ name: value(formData, "business_name"), phone: value(formData, "phone"), website: value(formData, "website"), primary_market: value(formData, "primary_market"), updated_at: new Date().toISOString() }).eq("id", session.businessId);
  const { error } = await supabase.from("business_settings").upsert({ business_id: session.businessId, business_name: value(formData, "business_name"), phone: value(formData, "phone"), website: value(formData, "website"), primary_market: value(formData, "primary_market"), widget_title: value(formData, "widget_title"), widget_quote_button_text: value(formData, "widget_quote_button_text"), updated_at: new Date().toISOString() }, { onConflict: "business_id" });
  if (error) return NextResponse.redirect(new URL("/client/settings?error=1", request.url), { status: 303 });
  return NextResponse.redirect(new URL("/client/settings?saved=1", request.url), { status: 303 });
}
