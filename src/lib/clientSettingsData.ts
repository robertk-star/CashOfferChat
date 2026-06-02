import { getDefaultFaqItems } from "@/lib/defaultFaqKnowledge";

export type ClientSettingsData = {
  business: {
    id: string;
    name: string;
    website: string;
    phone: string;
    email: string;
    primary_market: string;
    description: string;
    custom_ai_instructions: string;
    lead_notification_email: string;
    from_email: string;
    widget_title: string;
    widget_subtitle: string;
    widget_bubble_text: string;
    widget_quote_button_text: string;
    widget_success_message: string;
    widget_header_color: string;
    widget_button_color: string;
    widget_show_call_button: boolean;
    widget_call_button_text: string;
    widget_allowed_domains: string;
  };
  serviceAreasText: string;
  referralAreasText: string;
  willBuyText: string;
  willNotBuyText: string;
  managedFaqs: Array<{
    id?: string;
    question: string;
    answer: string;
    is_enabled?: boolean;
    sort_order?: number;
  }>;
};

function joinNames(rows: Array<{ name?: string | null; city?: string | null; label?: string | null; title?: string | null }> | null | undefined) {
  return (rows || [])
    .map((row) => row.name || row.city || row.label || row.title || "")
    .filter(Boolean)
    .join("\n");
}

function joinCriteria(rows: Array<{ label?: string | null; criteria?: string | null; item?: string | null; type?: string | null }> | null | undefined) {
  return (rows || [])
    .map((row) => row.label || row.criteria || row.item || "")
    .filter(Boolean)
    .join("\n");
}

export async function loadClientSettingsData(supabase: any, businessId: string): Promise<ClientSettingsData> {
  const { data: businessRow } = await supabase
    .from("businesses")
    .select("id, name, website, phone, email, primary_market, description")
    .eq("id", businessId)
    .maybeSingle();

  const { data: settingsRow } = await supabase
    .from("business_settings")
    .select("*")
    .eq("business_id", businessId)
    .maybeSingle();

  const { data: serviceAreas } = await supabase
    .from("service_areas")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: true });

  const { data: referralAreas } = await supabase
    .from("referral_areas")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: true });

  const { data: criteriaRows } = await supabase
    .from("property_buying_criteria")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: true });

  let managedFaqs: ClientSettingsData["managedFaqs"] = [];
  const { data: faqRows } = await supabase
    .from("managed_faq_items")
    .select("id, question, answer, is_enabled, sort_order")
    .eq("business_id", businessId)
    .order("sort_order", { ascending: true });

  if (faqRows && faqRows.length > 0) {
    managedFaqs = faqRows;
  } else {
    managedFaqs = getDefaultFaqItems().map((item, index) => ({
      question: item.question,
      answer: item.answer,
      is_enabled: true,
      sort_order: index,
    }));
  }

  const willBuy = (criteriaRows || []).filter((row: any) => row.type === "will_buy" || row.category === "will_buy");
  const willNotBuy = (criteriaRows || []).filter((row: any) => row.type === "will_not_buy" || row.category === "will_not_buy");

  return {
    business: {
      id: businessId,
      name: businessRow?.name || settingsRow?.business_name || "",
      website: businessRow?.website || settingsRow?.website || "",
      phone: businessRow?.phone || settingsRow?.phone || "",
      email: businessRow?.email || settingsRow?.email || "",
      primary_market: businessRow?.primary_market || settingsRow?.primary_market || "",
      description: businessRow?.description || settingsRow?.business_description || "",
      custom_ai_instructions: settingsRow?.custom_ai_instructions || "",
      lead_notification_email: settingsRow?.lead_notification_email || "",
      from_email: settingsRow?.from_email || "",
      widget_title: settingsRow?.widget_title || "Seller Intake Assistant",
      widget_subtitle: settingsRow?.widget_subtitle || "Answers questions and collects property basics",
      widget_bubble_text: settingsRow?.widget_bubble_text || "Questions? Chat with us",
      widget_quote_button_text: settingsRow?.widget_quote_button_text || "Enter House Info for a Quote",
      widget_success_message:
        settingsRow?.widget_success_message ||
        "Thanks. Your information was received. Someone from the team can review the details and follow up.",
      widget_header_color: settingsRow?.widget_header_color || "#0f172a",
      widget_button_color: settingsRow?.widget_button_color || "#f5b51b",
      widget_show_call_button: settingsRow?.widget_show_call_button ?? true,
      widget_call_button_text: settingsRow?.widget_call_button_text || "Call Now",
      widget_allowed_domains: settingsRow?.widget_allowed_domains || "",
    },
    serviceAreasText: joinNames(serviceAreas as any),
    referralAreasText: joinNames(referralAreas as any),
    willBuyText: joinCriteria(willBuy as any),
    willNotBuyText: joinCriteria(willNotBuy as any),
    managedFaqs,
  };
}

export function parseTextareaLines(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}
