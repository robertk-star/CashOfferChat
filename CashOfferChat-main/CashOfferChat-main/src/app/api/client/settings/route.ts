import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clientCookieName, verifyClientSessionToken } from "@/lib/clientAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function value(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function checked(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function redirectWithMessage(request: Request, kind: "saved" | "error", message?: string) {
  const url = new URL("/client/settings", request.url);
  if (kind === "saved") url.searchParams.set("saved", message || "1");
  else url.searchParams.set("error", message || "Settings could not be saved.");
  return NextResponse.redirect(url, { status: 303 });
}

function cleanHexColor(value: string, fallback: string) {
  const color = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(color)) return color.toLowerCase();
  if (/^#[0-9a-fA-F]{3}$/.test(color)) return color.toLowerCase();
  return fallback;
}

function isChecked(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function cleanDbMessage(message?: string | null) {
  if (!message) return "Database update failed.";
  if (message.includes("business_settings_business_id") || message.includes("ON CONFLICT")) {
    return "Settings table needs the multi-business settings SQL migration, or the business settings row could not be found.";
  }
  if (message.includes("column") && message.includes("does not exist")) {
    return `Settings table is missing a required column: ${message}`;
  }
  return message;
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
    return redirectWithMessage(request, "error", "Supabase is not configured.");
  }

  const formData = await request.formData();
  const businessName = value(formData, "business_name");
  const phone = value(formData, "phone");
  const website = value(formData, "website");
  const primaryMarket = value(formData, "primary_market");
  const widgetTitle = value(formData, "widget_title") || "Seller Intake Assistant";
  const widgetQuoteButtonText = value(formData, "widget_quote_button_text") || "Enter House Info for a Quote";
  const widgetShowCallButton = checked(formData, "widget_show_call_button");
  const widgetCallButtonText = value(formData, "widget_call_button_text") || "Call Now";
  const now = new Date().toISOString();

  if (!session.businessId) {
    return redirectWithMessage(request, "error", "Your client account is not attached to a business.");
  }

  if (!businessName) {
    return redirectWithMessage(request, "error", "Business name is required.");
  }

  const businessUpdate = await supabase
    .from("businesses")
    .update({
      name: businessName,
      phone,
      website,
      primary_market: primaryMarket,
      updated_at: now,
    })
    .eq("id", session.businessId);

  if (businessUpdate.error) {
    return redirectWithMessage(
      request,
      "error",
      `Business profile could not be saved: ${cleanDbMessage(businessUpdate.error.message)}`,
    );
  }

  const settingsPayload = {
    business_id: session.businessId,
    business_name: businessName,
    phone,
    website,
    primary_market: primaryMarket,
    widget_title: widgetTitle,
    widget_quote_button_text: widgetQuoteButtonText,
    widget_show_call_button: widgetShowCallButton,
    widget_call_button_text: widgetCallButtonText,
    updated_at: now,
  };

  const existingSettings = await supabase
    .from("business_settings")
    .select("id")
    .eq("business_id", session.businessId)
    .order("updated_at", { ascending: false });

  if (existingSettings.error) {
    return redirectWithMessage(
      request,
      "error",
      `Settings rows could not be checked: ${cleanDbMessage(existingSettings.error.message)}`,
    );
  }

  const existingRows = existingSettings.data || [];

  if (existingRows.length > 0) {
    const settingsUpdate = await supabase
      .from("business_settings")
      .update(settingsPayload)
      .eq("business_id", session.businessId);

    if (settingsUpdate.error) {
      return redirectWithMessage(
        request,
        "error",
        `Widget settings could not be saved: ${cleanDbMessage(settingsUpdate.error.message)}`,
      );
    }
  } else {
    const settingsInsert = await supabase
      .from("business_settings")
      .insert(settingsPayload);

    if (settingsInsert.error) {
      return redirectWithMessage(
        request,
        "error",
        `Widget settings row could not be created: ${cleanDbMessage(settingsInsert.error.message)}`,
      );
    }
  }

  return redirectWithMessage(
    request,
    "saved",
    "Settings saved. The phone display setting will be used the next time the widget loads with the current embed script.",
  );
}
