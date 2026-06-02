import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clientCookieName, verifyClientSessionToken } from "@/lib/clientAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { parseTextareaLines } from "@/lib/clientSettingsData";

function value(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

async function replaceRows(
  supabase: any,
  table: string,
  businessId: string,
  rows: Array<Record<string, unknown>>
) {
  await supabase.from(table).delete().eq("business_id", businessId);
  if (rows.length > 0) {
    await supabase.from(table).insert(rows);
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(clientCookieName())?.value;
  const session = verifyClientSessionToken(token);

  if (!session) {
    return NextResponse.redirect(new URL("/client/login", request.url), { status: 303 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.redirect(new URL("/client/settings?error=1", request.url), { status: 303 });
  }

  const formData = await request.formData();
  const businessId = session.businessId;
  const now = new Date().toISOString();

  const businessName = value(formData, "business_name");

  const businessUpdate = {
    name: businessName,
    website: value(formData, "website"),
    phone: value(formData, "phone"),
    email: value(formData, "email"),
    primary_market: value(formData, "primary_market"),
    description: value(formData, "description"),
    updated_at: now,
  };

  const { error: businessError } = await supabase
    .from("businesses")
    .update(businessUpdate)
    .eq("id", businessId);

  if (businessError) {
    return NextResponse.redirect(new URL("/client/settings?error=1", request.url), { status: 303 });
  }

  const settingsPayload = {
    business_id: businessId,
    business_name: businessName,
    website: value(formData, "website"),
    phone: value(formData, "phone"),
    email: value(formData, "email"),
    primary_market: value(formData, "primary_market"),
    business_description: value(formData, "description"),
    custom_ai_instructions: value(formData, "custom_ai_instructions"),
    lead_notification_email: value(formData, "lead_notification_email"),
    from_email: value(formData, "from_email"),
    widget_title: value(formData, "widget_title"),
    widget_subtitle: value(formData, "widget_subtitle"),
    widget_bubble_text: value(formData, "widget_bubble_text"),
    widget_quote_button_text: value(formData, "widget_quote_button_text"),
    widget_success_message: value(formData, "widget_success_message"),
    widget_header_color: value(formData, "widget_header_color") || "#0f172a",
    widget_button_color: value(formData, "widget_button_color") || "#f5b51b",
    widget_show_call_button: formData.get("widget_show_call_button") === "on",
    widget_call_button_text: value(formData, "widget_call_button_text"),
    widget_allowed_domains: value(formData, "widget_allowed_domains"),
    updated_at: now,
  };

  const { error: settingsError } = await supabase
    .from("business_settings")
    .upsert(settingsPayload, { onConflict: "business_id" });

  if (settingsError) {
    return NextResponse.redirect(new URL("/client/settings?error=1", request.url), { status: 303 });
  }

  const serviceAreas = parseTextareaLines(value(formData, "service_areas")).map((name) => ({
    business_id: businessId,
    name,
  }));

  const referralAreas = parseTextareaLines(value(formData, "referral_areas")).map((name) => ({
    business_id: businessId,
    name,
  }));

  const willBuy = parseTextareaLines(value(formData, "will_buy")).map((label) => ({
    business_id: businessId,
    type: "will_buy",
    label,
  }));

  const willNotBuy = parseTextareaLines(value(formData, "will_not_buy")).map((label) => ({
    business_id: businessId,
    type: "will_not_buy",
    label,
  }));

  await replaceRows(supabase, "service_areas", businessId, serviceAreas);
  await replaceRows(supabase, "referral_areas", businessId, referralAreas);
  await replaceRows(supabase, "property_buying_criteria", businessId, [...willBuy, ...willNotBuy]);

  const faqIds = formData.getAll("faq_id").map((item) => String(item || ""));
  const faqQuestions = formData.getAll("faq_question").map((item) => String(item || "").trim());
  const faqAnswers = formData.getAll("faq_answer").map((item) => String(item || "").trim());
  const removeIndexes = new Set(formData.getAll("faq_remove").map((item) => Number(item)));

  const faqRows = faqQuestions
    .map((question, index) => ({
      id: faqIds[index],
      question,
      answer: faqAnswers[index] || "",
      sort_order: index,
      is_enabled: true,
      removed: removeIndexes.has(index),
    }))
    .filter((faq) => faq.question && faq.answer && !faq.removed);

  const newQuestion = value(formData, "new_faq_question");
  const newAnswer = value(formData, "new_faq_answer");
  if (newQuestion && newAnswer) {
    faqRows.push({
      id: "",
      question: newQuestion,
      answer: newAnswer,
      sort_order: faqRows.length,
      is_enabled: true,
      removed: false,
    });
  }

  await supabase.from("managed_faq_items").delete().eq("business_id", businessId);

  if (faqRows.length > 0) {
    const insertFaqs = faqRows.map((faq, index) => ({
      business_id: businessId,
      question: faq.question,
      answer: faq.answer,
      is_enabled: faq.is_enabled,
      sort_order: index,
    }));

    await supabase.from("managed_faq_items").insert(insertFaqs);
  }

  return NextResponse.redirect(new URL("/client/settings?saved=1", request.url), { status: 303 });
}
