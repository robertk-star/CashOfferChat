import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { sendLeadNotification } from "@/lib/emailNotifications";

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
});

export async function POST(request: Request) {
  const parsed = leadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid lead request" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
  }

  const lead = parsed.data;
  if (!lead.name || !lead.phone || (!lead.propertyAddress && !lead.propertyCity)) {
    return NextResponse.json({ error: "Name, phone, and property location are required" }, { status: 400 });
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const notification = await sendLeadNotification(supabase, data);
  await supabase
    .from("seller_leads")
    .update({
      notification_sent_at: notification.sent ? new Date().toISOString() : null,
      notification_error: notification.error,
    })
    .eq("id", data.id);

  return NextResponse.json({ id: data.id, ok: true, notificationSent: notification.sent, notificationError: notification.error });
}
