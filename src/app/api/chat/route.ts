import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { CASH_OFFER_CHAT_SYSTEM_PROMPT } from "@/lib/aiGuardrails";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import {
  canCreateLead,
  capturedFieldLabels,
  extractIntakeFromMessages,
  fallbackGuidedReply,
  getMissingIntakeField,
  questionForField,
  type IntakeState,
} from "@/lib/intake";

const requestSchema = z.object({
  conversationId: z.string().uuid().nullable().optional(),
  message: z.string().min(1).max(2000),
  sourceUrl: z.string().url().optional(),
});

type StoredMessage = { role: string; content: string };

async function getConversationMessages(supabase: ReturnType<typeof getSupabaseAdmin>, conversationId: string) {
  if (!supabase) return [];
  const { data } = await supabase
    .from("conversation_messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(80);
  return (data || []) as StoredMessage[];
}

async function existingLeadForConversation(supabase: ReturnType<typeof getSupabaseAdmin>, conversationId: string | null) {
  if (!supabase || !conversationId) return null;
  const { data } = await supabase.from("seller_leads").select("id").eq("conversation_id", conversationId).limit(1).maybeSingle();
  return data?.id || null;
}

async function createLeadFromIntake({
  supabase,
  conversationId,
  intake,
  sourceUrl,
}: {
  supabase: ReturnType<typeof getSupabaseAdmin>;
  conversationId: string | null;
  intake: IntakeState;
  sourceUrl?: string;
}) {
  if (!supabase || !conversationId) return null;
  const alreadyExists = await existingLeadForConversation(supabase, conversationId);
  if (alreadyExists) return alreadyExists;

  const { data, error } = await supabase
    .from("seller_leads")
    .insert({
      conversation_id: conversationId,
      name: intake.name,
      phone: intake.phone,
      email: intake.email || null,
      property_address: intake.propertyAddress || null,
      property_city: intake.propertyCity || null,
      timeline: intake.timeline || null,
      situation: intake.situation || null,
      property_condition: intake.propertyCondition || null,
      notes: intake.notes || null,
      source_url: sourceUrl || null,
      status: "new",
    })
    .select("id")
    .single();

  if (error) return null;
  return data?.id || null;
}

async function buildAssistantReply(userMessage: string, intake: IntakeState, leadCreated: boolean) {
  const missingField = getMissingIntakeField(intake);
  const requiredQuestion = questionForField(missingField);
  const fallback = fallbackGuidedReply(userMessage, intake, leadCreated);

  if (!process.env.OPENAI_API_KEY) return fallback;

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.25,
      max_tokens: 220,
      messages: [
        { role: "system", content: CASH_OFFER_CHAT_SYSTEM_PROMPT },
        {
          role: "system",
          content: `Current captured seller intake JSON: ${JSON.stringify(intake)}\nLead created: ${leadCreated ? "yes" : "no"}. Answer the user's question briefly, keep it positive but not misleading, and end with this exact next intake question unless it would duplicate the answer: ${requiredQuestion}`,
        },
        { role: "user", content: userMessage },
      ],
    });
    return completion.choices[0]?.message?.content || fallback;
  } catch {
    return fallback;
  }
}

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid chat request" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  let conversationId = parsed.data.conversationId || null;

  if (supabase && !conversationId) {
    const { data, error } = await supabase
      .from("conversations")
      .insert({ source_url: parsed.data.sourceUrl || null, status: "active" })
      .select("id")
      .single();
    if (!error && data?.id) conversationId = data.id;
  }

  if (supabase && conversationId) {
    await supabase.from("conversation_messages").insert({
      conversation_id: conversationId,
      role: "user",
      content: parsed.data.message,
    });
  }

  const storedMessages = conversationId ? await getConversationMessages(supabase, conversationId) : [{ role: "user", content: parsed.data.message }];
  const intake = extractIntakeFromMessages(storedMessages.length ? storedMessages : [{ role: "user", content: parsed.data.message }]);
  const leadId = canCreateLead(intake)
    ? await createLeadFromIntake({ supabase, conversationId, intake, sourceUrl: parsed.data.sourceUrl })
    : await existingLeadForConversation(supabase, conversationId);
  const leadCreated = Boolean(leadId);
  const reply = await buildAssistantReply(parsed.data.message, intake, leadCreated);

  if (supabase && conversationId) {
    await supabase.from("conversation_messages").insert({
      conversation_id: conversationId,
      role: "assistant",
      content: reply,
    });
  }

  return NextResponse.json({
    conversationId,
    reply,
    intake: capturedFieldLabels(intake),
    missingField: getMissingIntakeField(intake),
    nextQuestion: questionForField(getMissingIntakeField(intake)),
    leadCreated,
    leadId,
  });
}
