const CLIENT_SETTINGS_FALLBACK_FAQS = [
  {
    question: "How is the cash offer price determined for my house?",
    answer:
      "Cash offers are generally based on the property location, size, layout, condition, comparable nearby sales, estimated repair costs, holding costs, resale risk, and the buyer's expected margin. A direct cash offer is usually designed for speed and convenience rather than a full retail listing price.",
  },
  {
    question: "Do cash buyers pay full market value?",
    answer:
      "A direct cash offer is usually not the same as a full retail market listing. Cash buyers often offer below full retail value because they take on repair costs, resale risk, holding costs, and the convenience of a faster as-is sale. Exact offers depend on the property and local market.",
  },
  {
    question: "Are there hidden fees, service charges, or commissions?",
    answer:
      "Many traditional direct cash buyers do not charge realtor commissions or service fees, but exact terms should always be confirmed before signing. Some iBuyer-style platforms may charge service fees or third-party closing costs.",
  },
  {
    question: "Do I need to clean the house or make repairs before selling?",
    answer:
      "Usually no. Many as-is cash buyers can review properties without requiring the seller to clean, repair, paint, or remove unwanted items first. The exact details depend on the property.",
  },
  {
    question: "What types of property situations do cash buyers handle?",
    answer:
      "Cash buyers often review single-family homes, townhomes, duplexes, condos, inherited properties, vacant houses, rental properties, properties needing repairs, and homes with tenants. Exact buying criteria depend on the business.",
  },
  {
    question: "How fast can the process move from start to finish?",
    answer:
      "Some cash buyers can provide an initial estimate or offer quickly, often within a day or two after reviewing the property details. Closing timing depends on the property, title status, and seller timeline.",
  },
  {
    question: "Do I have to move out immediately after accepting an offer?",
    answer:
      "Not necessarily. Many buyers can work with the seller on a closing and move-out timeline. The exact timing should be discussed with the team before signing an agreement.",
  },
  {
    question: "Am I obligated to sell if I request a cash offer?",
    answer:
      "No. Requesting information or an offer is generally non-binding. A seller is not obligated unless they choose to sign a formal purchase agreement.",
  },
  {
    question: "Can I sell to a cash buyer if I am already working with a real estate agent?",
    answer:
      "It may be possible, but if you have an active listing agreement or exclusivity contract, you may still have obligations to your agent. Review your agreement or speak with your agent or a qualified professional.",
  },
];

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
    managedFaqs = CLIENT_SETTINGS_FALLBACK_FAQS.map((item, index) => ({
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
