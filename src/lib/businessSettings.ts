import { SupabaseClient } from "@supabase/supabase-js";

type RawBusinessSettings = {
  business_name: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  primary_market: string | null;
  description: string | null;
  preferred_tone: string | null;
  custom_instructions: string | null;
  disclose_referral_contacts: boolean | null;
  lead_notification_email?: string | null;
  from_email?: string | null;
  use_custom_faq_knowledge_base?: boolean | null;
};

export type ServiceArea = { city: string; state: string | null; notes: string | null };
export type ReferralArea = {
  city: string;
  state: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  notes: string | null;
  auto_forward: boolean | null;
  public_disclosure: boolean | null;
};
export type BuyingCriterion = { category: "will_buy" | "will_not_buy"; label: string; notes: string | null };
export type CustomQAItem = { trigger_question: string; answer: string };

export type BusinessSettingsContext = {
  business: RawBusinessSettings;
  serviceAreas: ServiceArea[];
  referralAreas: ReferralArea[];
  willBuy: BuyingCriterion[];
  willNotBuy: BuyingCriterion[];
  customQA: CustomQAItem[];
};

export const defaultBusinessSettings: BusinessSettingsContext = {
  business: {
    business_name: "Sell My House Today Anywhere",
    website: "https://sellmyhousetodayanywhere.com/",
    phone: "972-555-0100",
    email: null,
    primary_market: "Plano, Texas and nearby North Texas areas",
    description: "Plano-area cash home buyer demo that reviews houses as-is for possible cash offers.",
    preferred_tone: "Friendly, plain-English, helpful, local, and no-pressure.",
    custom_instructions:
      "Do not make offers over chat. Do not guarantee that the company will buy a property. Do not give legal, tax, financial, or foreclosure advice.",
    disclose_referral_contacts: false,
    lead_notification_email: null,
    from_email: null,
    use_custom_faq_knowledge_base: false,
  },
  serviceAreas: [
    { city: "Plano", state: "TX", notes: null },
    { city: "Frisco", state: "TX", notes: null },
    { city: "McKinney", state: "TX", notes: null },
    { city: "Allen", state: "TX", notes: null },
    { city: "Richardson", state: "TX", notes: null },
    { city: "Carrollton", state: "TX", notes: null },
    { city: "Garland", state: "TX", notes: null },
  ],
  referralAreas: [],
  willBuy: [
    { category: "will_buy", label: "single-family houses", notes: null },
    { category: "will_buy", label: "inherited houses", notes: null },
    { category: "will_buy", label: "tenant-occupied houses", notes: null },
    { category: "will_buy", label: "houses needing repairs", notes: null },
    { category: "will_buy", label: "vacant houses", notes: null },
  ],
  willNotBuy: [
    { category: "will_not_buy", label: "properties outside the buying area", notes: "The team may still review or refer if a contact is available." },
  ],
  customQA: [
    {
      trigger_question: "Do you buy houses as-is?",
      answer:
        "Yes. Many properties can be reviewed as-is, which means sellers may not need to make repairs, clean out the house, or prepare it for showings before asking for a review.",
    },
    {
      trigger_question: "Can you stop foreclosure?",
      answer:
        "A fast sale may be one option to discuss, but we cannot give legal or financial advice or guarantee any foreclosure outcome. If there is a deadline, it is important to speak with a qualified professional as well as the buying team.",
    },
  ],
};

export async function getBusinessSettingsContext(supabase: SupabaseClient | null): Promise<BusinessSettingsContext> {
  if (!supabase) return defaultBusinessSettings;

  try {
    const [businessResult, serviceResult, referralResult, criteriaResult, qaResult] = await Promise.all([
      supabase.from("business_settings").select("business_name, website, phone, email, primary_market, description, preferred_tone, custom_instructions, disclose_referral_contacts, lead_notification_email, from_email, use_custom_faq_knowledge_base").eq("singleton_key", "default").maybeSingle(),
      supabase.from("service_areas").select("city, state, notes").eq("is_active", true).order("city"),
      supabase.from("referral_areas").select("city, state, contact_name, contact_email, contact_phone, notes, auto_forward, public_disclosure").order("city"),
      supabase.from("buying_criteria").select("category, label, notes").order("category").order("label"),
      supabase.from("custom_qa_items").select("trigger_question, answer").eq("is_active", true).order("created_at"),
    ]);

    if (businessResult.error && businessResult.error.code !== "PGRST116") return defaultBusinessSettings;

    const criteria = (criteriaResult.data || []) as BuyingCriterion[];
    return {
      business: businessResult.data || defaultBusinessSettings.business,
      serviceAreas: ((serviceResult.data || []) as ServiceArea[]).length ? (serviceResult.data as ServiceArea[]) : defaultBusinessSettings.serviceAreas,
      referralAreas: (referralResult.data || []) as ReferralArea[],
      willBuy: criteria.filter((item) => item.category === "will_buy"),
      willNotBuy: criteria.filter((item) => item.category === "will_not_buy"),
      customQA: ((qaResult.data || []) as CustomQAItem[]).length ? (qaResult.data as CustomQAItem[]) : defaultBusinessSettings.customQA,
    };
  } catch {
    return defaultBusinessSettings;
  }
}

export function formatBusinessSettingsForPrompt(settings: BusinessSettingsContext) {
  const serviceAreas = settings.serviceAreas.map((area) => [area.city, area.state].filter(Boolean).join(", ")).join("; ") || "Not specified";
  const referralAreas =
    settings.referralAreas
      .map((area) => {
        const contact = settings.business.disclose_referral_contacts && area.public_disclosure
          ? ` public contact: ${[area.contact_name, area.contact_phone, area.contact_email].filter(Boolean).join(" / ")}`
          : " private referral contact available internally only";
        return `${[area.city, area.state].filter(Boolean).join(", ")}${contact}${area.notes ? `; notes: ${area.notes}` : ""}`;
      })
      .join("\n") || "None listed";
  const willBuy = settings.willBuy.map((item) => `${item.label}${item.notes ? ` (${item.notes})` : ""}`).join("; ") || "Not specified";
  const willNotBuy = settings.willNotBuy.map((item) => `${item.label}${item.notes ? ` (${item.notes})` : ""}`).join("; ") || "Not specified";
  const customQA = settings.customQA.map((item) => `Q/trigger: ${item.trigger_question}\nAnswer: ${item.answer}`).join("\n\n") || "None listed";

  return `Business settings for this CashOfferChat client:\nBusiness name: ${settings.business.business_name || "Not specified"}\nWebsite: ${settings.business.website || "Not specified"}\nPhone: ${settings.business.phone || "Not specified"}\nEmail: ${settings.business.email || "Not specified"}\nPrimary market: ${settings.business.primary_market || "Not specified"}\nBusiness description: ${settings.business.description || "Not specified"}\nPreferred tone: ${settings.business.preferred_tone || "Friendly, helpful, and no-pressure"}\n\nCities/areas they buy in:\n${serviceAreas}\n\nCities/areas with referral contacts:\n${referralAreas}\n\nWhat they will buy:\n${willBuy}\n\nWhat they will not buy:\n${willNotBuy}\n\nCustom Q&A knowledge base:\n${customQA}\n\nCustom AI instructions:\n${settings.business.custom_instructions || "None"}\n\nImportant: Use these settings when answering seller questions. Do not reveal private referral contact details unless settings explicitly allow public disclosure. Do not make offers or guarantees.`;
}

export function normalizeForSettingsMatch(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

export function splitLines(value: string) {
  return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}
