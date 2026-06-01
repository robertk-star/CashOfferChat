import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { CASH_OFFER_CHAT_SYSTEM_PROMPT } from "@/lib/aiGuardrails";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const requestSchema = z.object({
  conversationId: z.string().uuid().nullable().optional(),
  message: z.string().min(1).max(2000),
  sourceUrl: z.string().url().optional(),
});

type DeterministicReply = {
  answer: string;
  showIntake: boolean;
  intent: "question" | "handoff" | "general";
};

function normalize(message: string) {
  return message.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function includesAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

function deterministicReply(message: string): DeterministicReply {
  const text = normalize(message);

  const handoff = includesAny(text, [
    "take a look",
    "look at it",
    "look at my house",
    "look at the property",
    "cash offer",
    "make an offer",
    "want an offer",
    "get an offer",
    "what would you pay",
    "call me",
    "contact me",
    "someone call",
    "talk to someone",
    "ready to sell",
    "need to sell",
    "sell it",
  ]);

  if (handoff) {
    return {
      intent: "handoff",
      showIntake: true,
      answer:
        "Yes. The team can review the basic property details and follow up with you. The easiest next step is to complete the short intake form on this page. There is no obligation to accept an offer.",
    };
  }

  if (includesAny(text, ["as is", "as-is", "repairs", "repair", "fix", "clean out", "cleanout", "condition"])) {
    return {
      intent: "question",
      showIntake: false,
      answer:
        "Yes. Many cash home buyers purchase houses as-is, so sellers may not need to make repairs, clean out the property, or prepare it for showings. If you want the team to review your property, you can use the short intake form when you are ready.",
    };
  }

  if (includesAny(text, ["how fast", "close", "closing", "timeline", "asap", "quick", "quickly", "30 days"])) {
    return {
      intent: "question",
      showIntake: false,
      answer:
        "Closing timing depends on the property, title work, and the seller's needs. A direct cash sale can often be simpler than a traditional listing, and many sellers choose a faster closing when everything is ready.",
    };
  }

  if (includesAny(text, ["tenant", "tenants", "renter", "renters", "occupied", "lease"])) {
    return {
      intent: "question",
      showIntake: false,
      answer:
        "Tenant-occupied properties may still be a fit. The best next step is to share the basic property details so the team can review the situation. You do not need to solve every tenant issue before asking.",
    };
  }

  if (includesAny(text, ["fee", "fees", "commission", "commissions", "realtor", "agent", "closing cost", "costs"])) {
    return {
      intent: "question",
      showIntake: false,
      answer:
        "A direct cash sale is usually different from listing with an agent. There may be no realtor commission when selling directly to a buyer, but the exact terms should be reviewed with the team before you decide.",
    };
  }

  if (includesAny(text, ["foreclosure", "behind", "late payment", "payments", "notice", "auction"])) {
    return {
      intent: "question",
      showIntake: false,
      answer:
        "A fast sale may be one option to discuss, but we cannot give legal or financial advice or guarantee any foreclosure outcome. If there is a deadline, it is important to speak with a qualified professional as well as the buying team.",
    };
  }

  if (includesAny(text, ["inherit", "inherited", "probate", "estate", "family property"])) {
    return {
      intent: "question",
      showIntake: false,
      answer:
        "Inherited properties are common in cash sale conversations. The team can review the property details and talk through possible next steps, but legal or probate questions should also be discussed with a qualified professional.",
    };
  }

  if (includesAny(text, ["area", "city", "where", "location", "county", "near", "service area"])) {
    return {
      intent: "question",
      showIntake: false,
      answer:
        "Service area depends on the home-buying company using CashOfferChat. For this demo, the focus is Austin and nearby areas. If you want a property reviewed, the intake form will ask for the city and address.",
    };
  }

  if (includesAny(text, ["hello", "hi", "hey", "help", "how does this work", "process"])) {
    return {
      intent: "general",
      showIntake: false,
      answer:
        "I can answer questions about selling a house as-is for cash. When you are ready, I can also open a short intake form so the team can review the property details and follow up.",
    };
  }

  return {
    intent: "general",
    showIntake: false,
    answer:
      "I can help with questions about selling a house as-is for cash, timelines, repairs, tenants, fees, and next steps. If you want the team to review a property, I can open the short intake form whenever you are ready.",
  };
}

async function maybeEnhanceReply(userMessage: string, safeAnswer: string) {
  if (!process.env.OPENAI_API_KEY) return safeAnswer;

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 150,
      messages: [
        { role: "system", content: CASH_OFFER_CHAT_SYSTEM_PROMPT },
        {
          role: "system",
          content:
            "Rewrite the safe answer in a friendly, plain-English tone for a homeowner. Do not extract form fields. Do not ask for name, phone, or email. Do not pressure the seller. Do not add legal, tax, financial, or foreclosure advice. Do not make promises about price, buying the home, or guaranteed outcomes.",
        },
        { role: "user", content: `Seller message: ${userMessage}\nSafe answer: ${safeAnswer}` },
      ],
    });

    return completion.choices[0]?.message?.content || safeAnswer;
  } catch {
    return safeAnswer;
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

  const deterministic = deterministicReply(parsed.data.message);
  const reply = await maybeEnhanceReply(parsed.data.message, deterministic.answer);

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
    showIntake: deterministic.showIntake,
    intent: deterministic.intent,
  });
}
