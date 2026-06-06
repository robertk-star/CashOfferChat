import { rowsToCsv } from "@/lib/csv";

export const leadExportHeaders = [
  "Created At",
  "Status",
  "Seller Name",
  "Phone",
  "Email",
  "Property Address",
  "Property City",
  "Situation",
  "Timeline",
  "Property Condition",
  "Seller Notes",
  "Admin/Internal Notes",
  "Source URL",
  "Site ID",
  "Business ID",
];

export function normalizeLeadStatus(status?: string | null) {
  return status || "new";
}

export function leadsToCsv(leads: any[]) {
  return rowsToCsv(
    leadExportHeaders,
    leads.map((lead) => [
      lead.created_at || "",
      normalizeLeadStatus(lead.status),
      lead.name || "",
      lead.phone || "",
      lead.email || "",
      lead.property_address || "",
      lead.property_city || "",
      lead.situation || "",
      lead.timeline || "",
      lead.property_condition || "",
      lead.notes || "",
      lead.admin_notes || "",
      lead.source_url || "",
      lead.site_id || "",
      lead.business_id || "",
    ])
  );
}

export function leadExportFilename(prefix: string) {
  const date = new Date().toISOString().slice(0, 10);
  return `${prefix}-leads-${date}.csv`;
}
