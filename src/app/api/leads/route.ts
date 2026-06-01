import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { sendLeadNotification } from "@/lib/emailNotifications";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

function jsonWithCors(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, { ...init, headers: { ...corsHeaders, ...(init?.headers || {}) } });
}

const leadSchema = z.object({
  conversationId: z.string().uuid().nullable().optional(),
  name: z.string().max(200).optional().default(""),
  phone: z.string().max(50).optional().default(""),
  email: z.string().email().optional().or(z.literal("")),
  propertyAddress: z.string().max(500).optional().default(""),
  propertyCity: z.string().max(120).optional().default(""),
  timeline: z.string().max(120).optional().default(""),
  situation: z.string().max(300).optional().default(""),
  propertyCondition: z.string().max(300).optional().default(""),
  notes: z.string().max(2000).optional().default(""),
  sourceUrl: z.string().url().optional(),
  siteId: z.string().max(120).optional(),
});

export async function POST(request: Request) {
  const parsed = leadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message || "Invalid lead request";
    return jsonWithCors({ error: firstIssue }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return jsonWithCors({ error: "Supabase is not configured" }, { status: 500 });
  }

  const lead = parsed.data;
  const missing: string[] = [];
  if (!lead.name.trim()) missing.push("name");
  if (!lead.phone.trim()) missing.push("phone number");
  if (!lead.propertyAddress.trim() && !lead.propertyCity.trim()) missing.push("property city or property address");
  if (missing.length > 0) {
    return jsonWithCors({ error: `Missing required field${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}` }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("seller_leads")
    .insert({
      conversation_id: lead.conversationId || null,
      name: lead.name,
      phone: lead.phone,
      email: lead.email || null,
      property_address: lead.propertyAddress || null,
      property_city: lead.propertyCity || null,
      timeline: lead.timeline || null,
      situation: lead.situation || null,
      property_condition: lead.propertyCondition || null,
      notes: lead.notes || null,
      source_url: lead.sourceUrl || null,
      status: "new",
    })
    .select("id, created_at, name, phone, email, property_address, property_city, timeline, situation, property_condition, notes, source_url")
    .single();

  if (error) {
    return jsonWithCors({ error: error.message }, { status: 500 });
  }

  let notification = { sent: false, error: null as string | null };
  try {
    notification = await sendLeadNotification(supabase, data);
    await supabase
      .from("seller_leads")
      .update({
        notification_sent_at: notification.sent ? new Date().toISOString() : null,
        notification_error: notification.error,
      })
      .eq("id", data.id);
  } catch (error) {
    notification = { sent: false, error: error instanceof Error ? error.message : "Notification failed" };
  }

  return jsonWithCors({ id: data.id, ok: true, notificationSent: notification.sent, notificationError: notification.error });
}
