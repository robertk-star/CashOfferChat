import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { CASH_OFFER_CHAT_SYSTEM_PROMPT } from "@/lib/aiGuardrails";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import {
  canCreateLead,
  capturedFieldLabels,
  fallbackGuidedReply,
  initialChatState,
  processUserTurn,
  questionForField,
  sellerQuestionAnswer,
  type ChatState,
  type IntakeField,
  type IntakeState,
} from "@/lib/intake";

const intakeSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  propertyAddress: z.string().optional(),
  propertyCity: z.string().optional(),
  timeline: z.string().optional(),
  situation: z.string().optional(),
  propertyCondition: z.string().optional(),
  notes: z.string().optional(),
}).partial();

const chatStateSchema = z.object({
  intake: intakeSchema.optional(),
  lastAskedField: z.enum([
    "propertyCity",
    "propertyAddress",
    "situation",
    "timeline",
    "propertyCondition",
    "followUpPermission",
    "name",
    "phone",
    "email",
  ]).nullable().optional(),
  conversationMode: z.enum(["qa", "intake", "handoff"]).optional(),
  leadReadiness: z.enum(["low", "medium", "high", "ready_for_contact"]).optional(),
  followUpPermission: z.boolean().nullable().optional(),
  leadCreated: z.boolean().optional(),
}).partial();

const requestSchema = z.object({
  conversationId: z.string().uuid().nullable().optional(),
  message: z.string().min(1).max(2000),
  sourceUrl: z.string().url().optional(),
  // Backward compatible: older demo builds sent only intake.
  intake: intakeSchema.optional(),
  chatState: chatStateSchema.optional(),
});

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

function normalizeIncomingState(input?: Partial<ChatState>, intake?: IntakeState): ChatState {
  return initialChatState({
    intake: { ...(intake || {}), ...(input?.intake || {}) },
    lastAskedField: (input?.lastAskedField as IntakeField | null | undefined) ?? "propertyCity",
    conversationMode: input?.conversationMode || "intake",
    leadReadiness: input?.leadReadiness || "low",
    followUpPermission: input?.followUpPermission ?? null,
    leadCreated: input?.leadCreated || false,
  });
}

async function maybeEnhanceQuestionAnswer(userMessage: string, deterministicAnswer?: string) {
  if (!process.env.OPENAI_API_KEY) return deterministicAnswer;
  if (!deterministicAnswer) return undefined;

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 130,
      messages: [
        { role: "system", content: CASH_OFFER_CHAT_SYSTEM_PROMPT },
        {
          role: "system",
          content:
            "Rewrite the provided answer in plain English for a homeowner. Keep it brief, helpful, positive, and safe. Do not ask for contact information. Do not add promises, prices, legal advice, tax advice, financial advice, or foreclosure guarantees.",
        },
        { role: "user", content: `Seller question: ${userMessage}\nSafe answer to preserve: ${deterministicAnswer}` },
      ],
    });
    return completion.choices[0]?.message?.content || deterministicAnswer;
  } catch {
    return deterministicAnswer;
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

  const incomingState = normalizeIncomingState(parsed.data.chatState as Partial<ChatState> | undefined, parsed.data.intake as IntakeState | undefined);
  const deterministicTurn = processUserTurn(parsed.data.message, incomingState);
  const enhancedAnswer = await maybeEnhanceQuestionAnswer(parsed.data.message, deterministicTurn.questionAnswer || sellerQuestionAnswer(parsed.data.message));
  const chatState = deterministicTurn.state;

  const existingLeadId = await existingLeadForConversation(supabase, conversationId);
  const shouldCreateLead = !existingLeadId && canCreateLead(chatState.intake);
  const leadId = shouldCreateLead
    ? await createLeadFromIntake({ supabase, conversationId, intake: chatState.intake, sourceUrl: parsed.data.sourceUrl })
    : existingLeadId;

  const leadCreated = Boolean(leadId);
  const finalState: ChatState = { ...chatState, leadCreated };
  const reply = fallbackGuidedReply(parsed.data.message, finalState, enhancedAnswer);

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
    intake: capturedFieldLabels(finalState.intake),
    chatState: finalState,
    missingField: finalState.lastAskedField,
    nextQuestion: questionForField(finalState.lastAskedField),
    leadCreated,
    leadId,
  });
}
