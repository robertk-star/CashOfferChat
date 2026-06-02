import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCookieName, verifyAdminSessionToken } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { splitLines } from "@/lib/businessSettings";

function parseCriterionLines(value: string) {
  return splitLines(value).map((line) => {
    const [label, ...notesParts] = line.split("|").map((part) => part.trim());
    return { label, notes: notesParts.join(" | ") || null };
  }).filter((item) => item.label);
}

function parseAreaLines(value: string) {
  return splitLines(value).map((line) => {
    const [city, state, ...notesParts] = line.split("|").map((part) => part.trim());
    return { city, state: state || null, notes: notesParts.join(" | ") || null };
  }).filter((item) => item.city);
}

function parseReferralLines(value: string) {
  return splitLines(value).map((line) => {
    const [city, state, contactName, contactEmail, contactPhone, ...notesParts] = line.split("|").map((part) => part.trim());
    return {
      city,
      state: state || null,
      contact_name: contactName || null,
      contact_email: contactEmail || null,
      contact_phone: contactPhone || null,
      notes: notesParts.join(" | ") || null,
      auto_forward: Boolean(contactEmail || contactPhone),
      public_disclosure: false,
    };
  }).filter((item) => item.city);
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName())?.value;
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.redirect(new URL("/admin/settings?error=supabase", request.url), { status: 303 });
  }

  const formData = await request.formData();
  const get = (key: string) => String(formData.get(key) || "").trim();
  const questionTriggers = formData.getAll("qa_trigger").map((value) => String(value || "").trim());
  const questionAnswers = formData.getAll("qa_answer").map((value) => String(value || "").trim());

  const settingsPayload = {
    singleton_key: "default",
    business_name: get("business_name") || "Sell My House Today Anywhere",
    website: get("website") || null,
    phone: get("phone") || null,
    email: get("email") || null,
    primary_market: get("primary_market") || null,
    description: get("description") || null,
    preferred_tone: get("preferred_tone") || "Friendly, plain-English, helpful, and no-pressure.",
    custom_instructions: get("custom_instructions") || null,
    disclose_referral_contacts: formData.get("disclose_referral_contacts") === "on",
    lead_notification_email: get("lead_notification_email") || null,
    from_email: get("from_email") || null,
    use_custom_faq_knowledge_base: formData.get("use_managed_faqs") === "1",
    widget_title: get("widget_title") || "Seller Intake Assistant",
    widget_subtitle: get("widget_subtitle") || "Answers questions and collects property basics",
    widget_bubble_text: get("widget_bubble_text") || "Questions? Chat with us",
    widget_quote_button_text: get("widget_quote_button_text") || "Enter House Info for a Quote",
    widget_success_message: get("widget_success_message") || "Thanks. Your information was received. Someone from the team can review the details and follow up.",
    widget_primary_color: get("widget_primary_color") || "#0f2440",
    widget_accent_color: get("widget_accent_color") || "#f5b84b",
    widget_show_call_button: formData.get("widget_show_call_button") === "on",
    widget_call_button_text: get("widget_call_button_text") || "Call Now",
    widget_allowed_domains: get("widget_allowed_domains") || null,
    updated_at: new Date().toISOString(),
  };

  const serviceAreas = parseAreaLines(get("service_areas"));
  const referralAreas = parseReferralLines(get("referral_areas"));
  const willBuy = parseCriterionLines(get("will_buy")).map((item) => ({ ...item, category: "will_buy" }));
  const willNotBuy = parseCriterionLines(get("will_not_buy")).map((item) => ({ ...item, category: "will_not_buy" }));
  const customQA = questionTriggers
    .map((trigger, index) => ({ trigger_question: trigger, answer: questionAnswers[index] || "", is_active: true }))
    .filter((item) => item.trigger_question && item.answer);

  const { error: settingsError } = await supabase
    .from("business_settings")
    .upsert(settingsPayload, { onConflict: "singleton_key" });
  if (settingsError) {
    return NextResponse.redirect(new URL(`/admin/settings?error=${encodeURIComponent(settingsError.message)}`, request.url), { status: 303 });
  }

  await Promise.all([
    supabase.from("service_areas").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
    supabase.from("referral_areas").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
    supabase.from("buying_criteria").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
    supabase.from("custom_qa_items").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
  ]);

  if (serviceAreas.length) await supabase.from("service_areas").insert(serviceAreas);
  if (referralAreas.length) await supabase.from("referral_areas").insert(referralAreas);
  if (willBuy.length || willNotBuy.length) await supabase.from("buying_criteria").insert([...willBuy, ...willNotBuy]);
  if (customQA.length) await supabase.from("custom_qa_items").insert(customQA);

  return NextResponse.redirect(new URL("/admin/settings?saved=1", request.url), { status: 303 });
}
