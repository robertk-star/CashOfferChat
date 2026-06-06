import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { buildLeadWebhookPayload, recordLeadWebhookResult, sendLeadWebhookForBusiness } from "@/lib/leadWebhook";

export const dynamic = "force-dynamic";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Cache-Control": "no-store, no-cache, must-revalidate",
  };
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

const leadSchema = z.object({
  conversationId: z.string().uuid().nullable().optional(),
  siteId: z.string().optional(),
  businessId: z.string().uuid().nullable().optional(),
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email().optional().or(z.literal("")).nullable(),
  propertyAddress: z.string().optional().nullable(),
  propertyCity: z.string().optional().nullable(),
  situation: z.string().optional().nullable(),
  timeline: z.string().optional().nullable(),
  propertyCondition: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  sourceUrl: z.string().optional().nullable(),
});

async function resolveConversationId(supabase: any, conversationId?: string | null) {
  if (!conversationId) return null;

  const { data } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", conversationId)
    .maybeSingle();

  return data?.id || null;
}

async function resolveBusinessId(supabase: any, siteId?: string | null, businessId?: string | null) {
  if (businessId) return businessId;
  if (!siteId) return null;

  const { data } = await supabase
    .from("widget_sites")
    .select("business_id")
    .eq("site_id", siteId)
    .maybeSingle();

  return data?.business_id || null;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = leadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message || "Invalid lead request" },
      { status: 400, headers: corsHeaders() }
    );
  }

  const data = parsed.data;

  if (!data.propertyAddress && !data.propertyCity) {
    return NextResponse.json(
      { error: "Property city or property address is required" },
      { status: 400, headers: corsHeaders() }
    );
  }

  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 500, headers: corsHeaders() }
    );
  }

  const [resolvedBusinessId, resolvedConversationId] = await Promise.all([
    resolveBusinessId(supabase, data.siteId, data.businessId),
    resolveConversationId(supabase, data.conversationId),
  ]);

  const insertPayload = {
    conversation_id: resolvedConversationId,
    business_id: resolvedBusinessId,
    site_id: data.siteId || null,
    status: "new",
    name: data.name,
    phone: data.phone,
    email: data.email || null,
    property_address: data.propertyAddress || null,
    property_city: data.propertyCity || null,
    situation: data.situation || null,
    timeline: data.timeline || null,
    property_condition: data.propertyCondition || null,
    notes: data.notes || null,
    source_url: data.sourceUrl || null,
  };

  const { data: lead, error } = await supabase
    .from("seller_leads")
    .insert(insertPayload)
    .select("*")
    .single();

  if (error || !lead) {
    return NextResponse.json(
      { error: error?.message || "Lead could not be saved" },
      { status: 500, headers: corsHeaders() }
    );
  }

  // Webhook delivery is intentionally non-blocking for lead creation.
  try {
    const payload = buildLeadWebhookPayload(lead, "seller_lead.created");
    const webhookResult = await sendLeadWebhookForBusiness({
      businessId: lead.business_id,
      payload,
    });

    if (!webhookResult.skipped) {
      await recordLeadWebhookResult(lead.id, {
        sent: webhookResult.sent,
        error: webhookResult.error,
      });
    }
  } catch (webhookError) {
    await recordLeadWebhookResult(lead.id, {
      sent: false,
      error: webhookError instanceof Error ? webhookError.message : "Unknown webhook error",
    });
  }

  return NextResponse.json(
    { ok: true, leadId: lead.id },
    { headers: corsHeaders() }
  );
}
