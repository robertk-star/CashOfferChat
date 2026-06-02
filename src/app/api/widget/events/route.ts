import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getSiteContext } from "@/lib/siteContext";

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

const eventSchema = z.object({
  siteId: z.string().max(120).optional().default("demo"),
  eventName: z.string().min(1).max(120),
  sourceUrl: z.string().url().optional(),
  conversationId: z.string().uuid().nullable().optional(),
  leadId: z.string().uuid().nullable().optional(),
  metadata: z.record(z.unknown()).optional().default({}),
});

function pageDomainFromUrl(sourceUrl?: string) {
  if (!sourceUrl) return null;
  try {
    return new URL(sourceUrl).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const parsed = eventSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return jsonWithCors({ error: "Invalid widget event" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return jsonWithCors({ ok: false, error: "Supabase is not configured" }, { status: 500 });
  }

  const event = parsed.data;
  const site = await getSiteContext(supabase, event.siteId);
  const { error } = await supabase.from("widget_events").insert({
    site_id: site.siteId,
    business_id: site.businessId,
    event_name: event.eventName,
    source_url: event.sourceUrl || null,
    page_domain: pageDomainFromUrl(event.sourceUrl),
    conversation_id: event.conversationId || null,
    lead_id: event.leadId || null,
    metadata: event.metadata || {},
  });

  if (error) {
    return jsonWithCors({ ok: false, error: error.message }, { status: 500 });
  }

  return jsonWithCors({ ok: true });
}
