import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getDefaultFaqItems } from "@/lib/defaultFaqKnowledge";

export const dynamic = "force-dynamic";

type ChatRequest = {
  siteId?: string;
  conversationId?: string | null;
  message?: string;
  sourceUrl?: string | null;
};

type BusinessContext = {
  businessId: string | null;
  siteId: string | null;
  businessName: string;
  phone: string;
  primaryMarket: string;
  serviceAreas: string[];
  referralAreas: string[];
  willBuy: string[];
  willNotBuy: string[];
  managedFaqs: Array<{ question: string; answer: string; is_enabled?: boolean | null }>;
  customFaqs: Array<{ question_trigger: string; answer: string; is_enabled?: boolean | null }>;
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

function normalize(text: string) {
  return String(text || "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text: string) {
  return new Set(normalize(text).split(" ").filter((token) => token.length > 2));
}

function keywordScore(message: string, keywords: string[]) {
  const normalizedMessage = normalize(message);
  let score = 0;

  for (const keyword of keywords) {
    const normalizedKeyword = normalize(keyword);
    if (!normalizedKeyword) continue;

    if (normalizedMessage.includes(normalizedKeyword)) {
      score += normalizedKeyword.split(" ").length >= 2 ? 4 : 2;
    }
  }

  return score;
}

function questionSimilarityScore(message: string, question: string) {
  const messageTokens = tokenize(message);
  const questionTokens = tokenize(question);
  let overlap = 0;

  for (const token of questionTokens) {
    if (messageTokens.has(token)) overlap += 1;
  }

  return overlap;
}

function softCta() {
  return " If you want the team to review your property, use the quote button and enter the house details.";
}

function shouldAddCta(answer: string) {
  const normalized = normalize(answer);
  return !normalized.includes("quote button") && !normalized.includes("enter the house") && !normalized.includes("property information");
}

function withCta(answer: string) {
  return shouldAddCta(answer) ? `${answer}${softCta()}` : answer;
}

function answerFromFaqList(
  message: string,
  faqs: Array<{ question: string; answer: string; keywords?: string[]; is_enabled?: boolean | null }>
) {
  let best: { answer: string; score: number } | null = null;

  for (const faq of faqs) {
    if (faq.is_enabled === false) continue;

    const score =
      questionSimilarityScore(message, faq.question) +
      keywordScore(message, faq.keywords || []) +
      keywordScore(message, [faq.question]);

    if (score > (best?.score || 0)) {
      best = { answer: faq.answer, score };
    }
  }

  if (!best || best.score < 2) return null;
  return withCta(best.answer);
}

function answerFromCustomFaqs(
  message: string,
  faqs: Array<{ question_trigger: string; answer: string; is_enabled?: boolean | null }>
) {
  let best: { answer: string; score: number } | null = null;

  for (const faq of faqs) {
    if (faq.is_enabled === false) continue;

    const score =
      questionSimilarityScore(message, faq.question_trigger) +
      keywordScore(message, [faq.question_trigger]);

    if (score > (best?.score || 0)) {
      best = { answer: faq.answer, score };
    }
  }

  if (!best || best.score < 2) return null;
  return withCta(best.answer);
}

function answerFromBusinessRules(message: string, context: BusinessContext) {
  const normalized = normalize(message);

  if (
    (normalized.includes("where") || normalized.includes("area") || normalized.includes("city") || normalized.includes("buy in")) &&
    context.serviceAreas.length
  ) {
    return withCta(
      `The main buying areas currently listed are ${context.serviceAreas.slice(0, 12).join(", ")}. If your property is nearby or you are not sure, you can still enter the house information so the team can review it.`
    );
  }

  for (const area of context.serviceAreas) {
    if (normalize(area) && normalized.includes(normalize(area))) {
      return withCta(
        `Yes, ${area} is listed as one of the buying areas for this business.`
      );
    }
  }

  for (const area of context.referralAreas) {
    if (normalize(area) && normalized.includes(normalize(area))) {
      return withCta(
        `${area} appears to be a referral or extended area. The team may be able to review it or point you in the right direction.`
      );
    }
  }

  if ((normalized.includes("what") || normalized.includes("type")) && normalized.includes("buy") && context.willBuy.length) {
    return withCta(
      `This business lists these property types or situations as ones they review: ${context.willBuy.slice(0, 12).join(", ")}.`
    );
  }

  if ((normalized.includes("dont") || normalized.includes("do not") || normalized.includes("won't") || normalized.includes("not buy")) && context.willNotBuy.length) {
    return withCta(
      `This business lists these as property types or situations they may not typically buy: ${context.willNotBuy.slice(0, 12).join(", ")}. You can still enter the basics and the team can confirm.`
    );
  }

  return null;
}

function safeFallback(message: string) {
  const normalized = normalize(message);

  if (normalized.includes("offer") || normalized.includes("quote") || normalized.includes("look") || normalized.includes("review")) {
    return "I can help collect the basic property details so the team can review it. Use the quote button and enter the house information when you are ready.";
  }

  return "I can help with questions about selling a house as-is for cash, including repairs, timelines, tenants, fees, and next steps. If you want the team to review a property, use the quote button and enter the house details.";
}

async function resolveBusinessContext(siteId?: string | null): Promise<BusinessContext> {
  const supabase = getSupabaseAdmin();

  const fallback: BusinessContext = {
    businessId: null,
    siteId: siteId || null,
    businessName: "CashOfferChat",
    phone: "",
    primaryMarket: "",
    serviceAreas: [],
    referralAreas: [],
    willBuy: [],
    willNotBuy: [],
    managedFaqs: [],
    customFaqs: [],
  };

  if (!supabase) return fallback;

  let businessId: string | null = null;

  if (siteId) {
    const { data: site } = await supabase
      .from("widget_sites")
      .select("business_id, site_id")
      .eq("site_id", siteId)
      .maybeSingle();

    businessId = site?.business_id || null;
  }

  if (!businessId) {
    const { data: business } = await supabase
      .from("businesses")
      .select("id")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    businessId = business?.id || null;
  }

  if (!businessId) return fallback;

  const [
    businessResult,
    settingsResult,
    serviceResult,
    referralResult,
    criteriaResult,
    managedFaqResult,
    customFaqResult,
  ] = await Promise.all([
    supabase.from("businesses").select("name, phone, primary_market").eq("id", businessId).maybeSingle(),
    supabase.from("business_settings").select("*").eq("business_id", businessId).maybeSingle(),
    supabase.from("service_areas").select("name").eq("business_id", businessId).order("created_at", { ascending: true }),
    supabase.from("referral_areas").select("name").eq("business_id", businessId).order("created_at", { ascending: true }),
    supabase.from("property_buying_criteria").select("type, label").eq("business_id", businessId).order("created_at", { ascending: true }),
    supabase.from("managed_faq_items").select("question, answer, is_enabled").eq("business_id", businessId).order("sort_order", { ascending: true }),
    supabase.from("custom_qa_items").select("question_trigger, answer, is_enabled").eq("business_id", businessId).order("sort_order", { ascending: true }),
  ]);

  const criteria = criteriaResult.data || [];

  return {
    businessId,
    siteId: siteId || null,
    businessName:
      settingsResult.data?.business_name ||
      businessResult.data?.name ||
      fallback.businessName,
    phone: settingsResult.data?.phone || businessResult.data?.phone || "",
    primaryMarket:
      settingsResult.data?.primary_market ||
      businessResult.data?.primary_market ||
      "",
    serviceAreas: (serviceResult.data || []).map((row: any) => row.name).filter(Boolean),
    referralAreas: (referralResult.data || []).map((row: any) => row.name).filter(Boolean),
    willBuy: criteria.filter((row: any) => row.type === "will_buy").map((row: any) => row.label).filter(Boolean),
    willNotBuy: criteria.filter((row: any) => row.type === "will_not_buy").map((row: any) => row.label).filter(Boolean),
    managedFaqs: (managedFaqResult.data || []) as any[],
    customFaqs: (customFaqResult.data || []) as any[],
  };
}

async function saveConversation({
  conversationId,
  message,
  reply,
  sourceUrl,
  siteId,
  businessId,
}: {
  conversationId?: string | null;
  message: string;
  reply: string;
  sourceUrl?: string | null;
  siteId?: string | null;
  businessId?: string | null;
}) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return conversationId || null;

  let currentConversationId = conversationId || null;

  try {
    if (currentConversationId) {
      const { data: existingConversation } = await supabase
        .from("conversations")
        .select("id")
        .eq("id", currentConversationId)
        .maybeSingle();

      if (!existingConversation?.id) {
        currentConversationId = null;
      }
    }

    if (!currentConversationId) {
      const { data: conversation } = await supabase
        .from("conversations")
        .insert({
          source_url: sourceUrl || null,
          site_id: siteId || null,
          business_id: businessId || null,
          status: "active",
          updated_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      currentConversationId = conversation?.id || null;
    }

    if (currentConversationId) {
      await supabase.from("conversation_messages").insert([
        {
          conversation_id: currentConversationId,
          role: "user",
          content: message,
        },
        {
          conversation_id: currentConversationId,
          role: "assistant",
          content: reply,
        },
      ]);

      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", currentConversationId);
    }
  } catch (_) {
    return currentConversationId;
  }

  return currentConversationId;
}

function getAnswer(message: string, context: BusinessContext) {
  const customAnswer = answerFromCustomFaqs(message, context.customFaqs);
  if (customAnswer) return customAnswer;

  const managedAnswer = answerFromFaqList(message, context.managedFaqs);
  if (managedAnswer) return managedAnswer;

  const defaultAnswer = answerFromFaqList(message, getDefaultFaqItems());
  if (defaultAnswer) return defaultAnswer;

  const businessAnswer = answerFromBusinessRules(message, context);
  if (businessAnswer) return businessAnswer;

  return safeFallback(message);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as ChatRequest | null;

  const message = String(body?.message || "").trim();
  const siteId = body?.siteId || "demo";

  if (!message) {
    return NextResponse.json(
      { error: "Message is required" },
      { status: 400, headers: corsHeaders() }
    );
  }

  const context = await resolveBusinessContext(siteId);
  const reply = getAnswer(message, context);

  const conversationId = await saveConversation({
    conversationId: body?.conversationId || null,
    message,
    reply,
    sourceUrl: body?.sourceUrl || null,
    siteId,
    businessId: context.businessId,
  });

  return NextResponse.json(
    {
      ok: true,
      reply,
      conversationId,
      businessId: context.businessId,
      siteId,
    },
    { headers: corsHeaders() }
  );
}
