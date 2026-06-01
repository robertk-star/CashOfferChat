import { getBusinessSettingsContext } from "@/lib/businessSettings";
import { SupabaseClient } from "@supabase/supabase-js";

export type LeadNotificationPayload = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  property_address: string | null;
  property_city: string | null;
  timeline: string | null;
  situation: string | null;
  property_condition: string | null;
  notes: string | null;
  source_url: string | null;
  created_at?: string | null;
};

function escapeHtml(value: string | null | undefined) {
  return String(value || "—")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;");
}

function field(label: string, value: string | null | undefined) {
  return `<tr><td style="padding:8px 12px;font-weight:700;color:#334155;border-bottom:1px solid #e2e8f0;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:8px 12px;color:#0f172a;border-bottom:1px solid #e2e8f0;white-space:pre-wrap;">${escapeHtml(value)}</td></tr>`;
}

function buildLeadAdminUrl(leadId: string) {
  const appUrl = (process.env.APP_URL || "https://cashofferchat.com").replace(/\/$/, "");
  return `${appUrl}/admin/leads/${leadId}`;
}

function buildEmailHtml(lead: LeadNotificationPayload) {
  const leadUrl = buildLeadAdminUrl(lead.id);
  return `
  <div style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px;color:#0f172a;">
    <div style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;">
      <div style="background:#0f172a;color:#ffffff;padding:22px 24px;">
        <h1 style="margin:0;font-size:22px;">New CashOfferChat Seller Lead</h1>
        <p style="margin:8px 0 0;color:#cbd5e1;">A new seller submitted property details.</p>
      </div>
      <div style="padding:24px;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          ${field("Seller name", lead.name)}
          ${field("Phone", lead.phone)}
          ${field("Email", lead.email)}
          ${field("Property address", lead.property_address)}
          ${field("City", lead.property_city)}
          ${field("Timeline", lead.timeline)}
          ${field("Situation", lead.situation)}
          ${field("Condition", lead.property_condition)}
          ${field("Seller notes", lead.notes)}
          ${field("Source URL", lead.source_url)}
          ${field("Created", lead.created_at ? new Date(lead.created_at).toLocaleString() : null)}
        </table>
        <p style="margin:24px 0 0;">
          <a href="${leadUrl}" style="display:inline-block;background:#f5b642;color:#0f172a;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:999px;">Open Lead in Admin</a>
        </p>
      </div>
    </div>
  </div>`;
}

function buildEmailText(lead: LeadNotificationPayload) {
  return [
    "New CashOfferChat Seller Lead",
    "",
    `Seller name: ${lead.name || "—"}`,
    `Phone: ${lead.phone || "—"}`,
    `Email: ${lead.email || "—"}`,
    `Property address: ${lead.property_address || "—"}`,
    `City: ${lead.property_city || "—"}`,
    `Timeline: ${lead.timeline || "—"}`,
    `Situation: ${lead.situation || "—"}`,
    `Condition: ${lead.property_condition || "—"}`,
    `Seller notes: ${lead.notes || "—"}`,
    `Source URL: ${lead.source_url || "—"}`,
    `Open lead: ${buildLeadAdminUrl(lead.id)}`,
  ].join("\n");
}

export async function sendLeadNotification(supabase: SupabaseClient, lead: LeadNotificationPayload) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return { sent: false, error: "RESEND_API_KEY is not configured." };
  }

  const settings = await getBusinessSettingsContext(supabase);
  const to = settings.business.lead_notification_email || process.env.LEAD_NOTIFICATION_EMAIL;
  const from = settings.business.from_email || process.env.FROM_EMAIL || "CashOfferChat <onboarding@resend.dev>";

  if (!to) {
    return { sent: false, error: "No lead notification email is configured." };
  }

  const subjectCity = lead.property_city ? ` — ${lead.property_city}` : "";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: `New CashOfferChat Seller Lead${subjectCity}`,
      html: buildEmailHtml(lead),
      text: buildEmailText(lead),
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "Unknown Resend error");
    return { sent: false, error: body.slice(0, 1000) };
  }

  return { sent: true, error: null };
}
