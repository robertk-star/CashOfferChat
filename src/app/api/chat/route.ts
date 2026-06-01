import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { CASH_OFFER_CHAT_SYSTEM_PROMPT, fallbackAssistantReply } from "@/lib/aiGuardrails";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const requestSchema = z.object({
  conversationId: z.string().uuid().nullable().optional(),
  message: z.string().min(1).max(2000),
  sourceUrl: z.string().url().optional(),
});

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

  let reply = fallbackAssistantReply(parsed.data.message);

  if (process.env.OPENAI_API_KEY) {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.3,
        max_tokens: 280,
        messages: [
          { role: "system", content: CASH_OFFER_CHAT_SYSTEM_PROMPT },
          { role: "user", content: parsed.data.message },
        ],
      });
      reply = completion.choices[0]?.message?.content || reply;
    } catch {
      reply = fallbackAssistantReply(parsed.data.message);
    }
  }

  if (supabase && conversationId) {
    await supabase.from("conversation_messages").insert({
      conversation_id: conversationId,
      role: "assistant",
      content: reply,
    });
  }

  return NextResponse.json({ conversationId, reply });
}
