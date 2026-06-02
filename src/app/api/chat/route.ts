import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { CASH_OFFER_CHAT_SYSTEM_PROMPT } from "@/lib/aiGuardrails";
import { getBusinessSettingsContext, formatBusinessSettingsForPrompt, normalizeForSettingsMatch, type BusinessSettingsContext } from "@/lib/businessSettings";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { findDefaultFAQAnswer, formatDefaultFAQForPrompt } from "@/lib/defaultFaqKnowledge";


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
  return normalizeForSettingsMatch(message);
}

function includesAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(normalize(term)));
}

function tokenize(value: string) {
  return normalize(value).split(" ").filter((token) => token.length > 2 && !["you", "the", "and", "for", "can", "how", "does", "with", "that", "this", "what", "will", "would", "buy", "house", "houses"].includes(token));
}

function findCustomQA(message: string, settings: BusinessSettingsContext) {
  const normalizedMessage = normalize(message);
  let bestMatch: { answer: string; score: number } | null = null;

  for (const item of settings.customQA) {
    const trigger = normalize(item.trigger_question);
    if (!trigger || !item.answer) continue;

    let score = 0;
    if (normalizedMessage.includes(trigger) || trigger.includes(normalizedMessage)) score += 10;

    const triggerTokens = tokenize(item.trigger_question);
    for (const token of triggerTokens) {
      if (normalizedMessage.includes(token)) score += 1;
    }

    if (score >= 2 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { answer: item.answer, score };
    }
  }

  return bestMatch?.answer || null;
}

function findCityMention(text: string, settings: BusinessSettingsContext) {
  const normalizedText = normalize(text);
  const serviceArea = settings.serviceAreas.find((area) => normalizedText.includes(normalize(area.city)));
  if (serviceArea) return { type: "service" as const, city: serviceArea.city, state: serviceArea.state };

  const referralArea = settings.referralAreas.find((area) => normalizedText.includes(normalize(area.city)));
  if (referralArea) return { type: "referral" as const, city: referralArea.city, state: referralArea.state };

  return null;
}

function deterministicReply(message: string, settings: BusinessSettingsContext): DeterministicReply {
  const text = normalize(message);
  const businessName = settings.business.business_name || "the team";
  const customAnswer = findCustomQA(message, settings);

  if (customAnswer) {
    return { intent: "question", showIntake: false, answer: customAnswer };
  }

  if (!settings.business.use_custom_faq_knowledge_base) {
    const defaultFAQ = findDefaultFAQAnswer(message);
    if (defaultFAQ) {
      return { intent: "question", showIntake: false, answer: defaultFAQ.answer };
    }
  }

  const handoff = includesAny(text, [
    "take a look",
    "look at it",
    "look at my house",
    "look at the property",
    "review my property",
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
    "need a quote",
    "get a quote",
    "request a quote",
  ]);

  if (handoff) {
    return {
      intent: "handoff",
      showIntake: true,
      answer:
        `Yes. ${businessName} can review the basic property details and follow up with you. The easiest next step is to complete the short intake form on this page. There is no obligation to accept an offer.`,
    };
  }

  const cityMention = findCityMention(message, settings);
  if (cityMention?.type === "service") {
    return {
      intent: "question",
      showIntake: false,
      answer: `Yes. ${cityMention.city}${cityMention.state ? `, ${cityMention.state}` : ""} is listed as one of the buying areas. If you want the team to review a property there, you can open the short intake form when you are ready.`,
    };
  }
  if (cityMention?.type === "referral") {
    return {
      intent: "question",
      showIntake: false,
      answer: `${cityMention.city}${cityMention.state ? `, ${cityMention.state}` : ""} is listed as an area where the business may have a referral contact. I can collect the property details for review, but I will not share private referral contact details here.`,
    };
  }

  if (includesAny(text, ["as is", "as-is", "repairs", "repair", "fix", "clean out", "cleanout", "condition"])) {
    const willBuyRepairs = settings.willBuy.some((item) => normalize(item.label + " " + (item.notes || "")).includes("repair"));
    return {
      intent: "question",
      showIntake: false,
      answer: willBuyRepairs
        ? `Yes. ${businessName} lists houses needing repairs among the property types they may review. Sellers may not need to make repairs, clean out the property, or prepare it for showings before asking for a review.`
        : `Many cash buyers review as-is situations, but the best answer depends on this business's buying criteria and the property details. You can use the intake form if you want the team to review it.`,
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
    const buysTenants = settings.willBuy.some((item) => normalize(item.label + " " + (item.notes || "")).includes("tenant"));
    return {
      intent: "question",
      showIntake: false,
      answer: buysTenants
        ? `Yes. ${businessName} lists tenant-occupied properties as a property type they may review. The team will usually want to understand whether the property is occupied, whether there is a lease, and the general situation.`
        : "Tenant-occupied properties may still be worth asking about, but the team would need to review the details before saying whether it is a fit.",
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
    const buysInherited = settings.willBuy.some((item) => normalize(item.label + " " + (item.notes || "")).includes("inherit"));
    return {
      intent: "question",
      showIntake: false,
      answer: buysInherited
        ? `Yes. ${businessName} lists inherited properties among the property types they may review. Legal or probate questions should still be discussed with a qualified professional.`
        : "Inherited properties are common in cash sale conversations, but the team would need to review the property details and any ownership issues before saying whether it is a fit.",
    };
  }

  if (includesAny(text, ["area", "city", "where", "location", "county", "near", "service area"])) {
    const cities = settings.serviceAreas.map((area) => area.city).slice(0, 10).join(", ");
    return {
      intent: "question",
      showIntake: false,
      answer: cities
        ? `${businessName}'s listed buying areas include ${cities}. If your city is not listed, the team may still be able to review it or route it if a referral contact is available.`
        : "Service area depends on the home-buying company using CashOfferChat. If you want a property reviewed, the intake form will ask for the city and address.",
    };
  }

  if (includesAny(text, ["hello", "hi", "hey", "help", "how does this work", "process"])) {
    return {
      intent: "general",
      showIntake: false,
      answer:
        `I can answer questions about selling a house as-is for cash using ${businessName}'s settings. When you are ready, I can also open a short intake form so the team can review the property details and follow up.`,
    };
  }

  return {
    intent: "general",
    showIntake: false,
    answer:
      "I can help with questions about selling a house as-is for cash, buying areas, property types, timelines, repairs, tenants, fees, and next steps. If you want the team to review a property, I can open the short intake form whenever you are ready.",
  };
}

async function maybeEnhanceReply(userMessage: string, safeAnswer: string, settings: BusinessSettingsContext) {
  if (!process.env.OPENAI_API_KEY) return safeAnswer;

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 180,
      messages: [
        { role: "system", content: CASH_OFFER_CHAT_SYSTEM_PROMPT },
        { role: "system", content: formatBusinessSettingsForPrompt(settings) },
        { role: "system", content: settings.business.use_custom_faq_knowledge_base ? "The business is using a managed FAQ knowledge base from Custom Q&A. Do not use built-in default FAQ answers that were removed from settings." : `Default FAQ knowledge base. Use this only after business-specific custom Q&A and before generic fallback answers. Do not browse the web or add unsupported claims.\n\n${formatDefaultFAQForPrompt()}` },
        {
          role: "system",
          content:
            "Rewrite the safe answer in a friendly, plain-English tone for a homeowner. Use business custom Q&A first, then the default FAQ knowledge base, then business settings. Do not browse the web. Do not extract form fields. Do not ask for name, phone, or email. Do not pressure the seller. Do not add legal, tax, financial, or foreclosure advice. Do not make promises about price, buying the home, or guaranteed outcomes. Do not reveal private referral contact details.",
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
    return jsonWithCors({ error: "Invalid chat request" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const settings = await getBusinessSettingsContext(supabase);
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

  const deterministic = deterministicReply(parsed.data.message, settings);
  const reply = await maybeEnhanceReply(parsed.data.message, deterministic.answer, settings);

  if (supabase && conversationId) {
    await supabase.from("conversation_messages").insert({
      conversation_id: conversationId,
      role: "assistant",
      content: reply,
    });
  }

  return jsonWithCors({
    conversationId,
    reply,
    showIntake: deterministic.showIntake,
    intent: deterministic.intent,
  });
}
