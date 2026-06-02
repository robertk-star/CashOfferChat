import { existsSync } from "fs";
import path from "path";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export type HealthStatus = "ok" | "warning" | "error";

export type HealthItem = {
  name: string;
  status: HealthStatus;
  message: string;
  detail?: string;
};

export type SystemHealth = {
  checkedAt: string;
  overallStatus: HealthStatus;
  env: HealthItem[];
  tables: HealthItem[];
  routes: HealthItem[];
  apiRoutes: HealthItem[];
  qaChecklist: HealthItem[];
};

const requiredEnv = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "ADMIN_DASHBOARD_PASSWORD",
  "ADMIN_SESSION_SECRET",
  "CLIENT_SESSION_SECRET",
  "APP_URL",
];

const optionalEnv = [
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "OPENAI_API_KEY",
  "OPENAI_MODEL",
  "RESEND_API_KEY",
  "FROM_EMAIL",
  "LEAD_NOTIFICATION_EMAIL",
];

const tableChecks = [
  "businesses",
  "business_settings",
  "widget_sites",
  "business_users",
  "seller_leads",
  "conversations",
  "conversation_messages",
  "widget_events",
  "service_areas",
  "referral_areas",
  "property_buying_criteria",
  "managed_faq_items",
  "custom_qa_items",
];

const routeFileChecks = [
  { route: "/", file: "src/app/page.tsx" },
  { route: "/widget-demo", file: "src/app/widget-demo/page.tsx" },
  { route: "/widget.js", file: "public/widget.js" },

  { route: "/admin/login", file: "src/app/admin/login/page.tsx" },
  { route: "/admin", file: "src/app/admin/page.tsx" },
  { route: "/admin/system", file: "src/app/admin/system/page.tsx" },
  { route: "/admin/businesses", file: "src/app/admin/businesses/page.tsx" },
  { route: "/admin/businesses/[id]", file: "src/app/admin/businesses/[id]/page.tsx" },
  { route: "/admin/onboarding", file: "src/app/admin/onboarding/page.tsx" },
  { route: "/admin/sites", file: "src/app/admin/sites/page.tsx" },
  { route: "/admin/sites/[id]", file: "src/app/admin/sites/[id]/page.tsx" },
  { route: "/admin/clients", file: "src/app/admin/clients/page.tsx" },
  { route: "/admin/clients/[id]", file: "src/app/admin/clients/[id]/page.tsx" },
  { route: "/admin/settings", file: "src/app/admin/settings/page.tsx" },
  { route: "/admin/analytics", file: "src/app/admin/analytics/page.tsx" },
  { route: "/admin/leads/[id]", file: "src/app/admin/leads/[id]/page.tsx" },

  { route: "/client/login", file: "src/app/client/login/page.tsx" },
  { route: "/client", file: "src/app/client/page.tsx" },
  { route: "/client/leads/[id]", file: "src/app/client/leads/[id]/page.tsx" },
  { route: "/client/sites", file: "src/app/client/sites/page.tsx" },
  { route: "/client/sites/[id]", file: "src/app/client/sites/[id]/page.tsx" },
  { route: "/client/analytics", file: "src/app/client/analytics/page.tsx" },
  { route: "/client/integrations", file: "src/app/client/integrations/page.tsx" },
  { route: "/client/settings", file: "src/app/client/settings/page.tsx" },
  { route: "/client/account", file: "src/app/client/account/page.tsx" },
];

const apiRouteFileChecks = [
  { route: "/api/admin/login", file: "src/app/api/admin/login/route.ts" },
  { route: "/api/admin/logout", file: "src/app/api/admin/logout/route.ts" },
  { route: "/api/admin/system/health", file: "src/app/api/admin/system/health/route.ts" },
  { route: "/api/admin/businesses/[id]", file: "src/app/api/admin/businesses/[id]/route.ts" },
  { route: "/api/admin/onboarding", file: "src/app/api/admin/onboarding/route.ts" },
  { route: "/api/admin/sites", file: "src/app/api/admin/sites/route.ts" },
  { route: "/api/admin/sites/[id]", file: "src/app/api/admin/sites/[id]/route.ts" },
  { route: "/api/admin/clients", file: "src/app/api/admin/clients/route.ts" },
  { route: "/api/admin/clients/[id]", file: "src/app/api/admin/clients/[id]/route.ts" },
  { route: "/api/admin/settings", file: "src/app/api/admin/settings/route.ts" },
  { route: "/api/admin/leads/[id]", file: "src/app/api/admin/leads/[id]/route.ts" },
  { route: "/api/admin/leads/export", file: "src/app/api/admin/leads/export/route.ts" },

  { route: "/api/client/login", file: "src/app/api/client/login/route.ts" },
  { route: "/api/client/logout", file: "src/app/api/client/logout/route.ts" },
  { route: "/api/client/leads/[id]", file: "src/app/api/client/leads/[id]/route.ts" },
  { route: "/api/client/leads/export", file: "src/app/api/client/leads/export/route.ts" },
  { route: "/api/client/sites/[id]", file: "src/app/api/client/sites/[id]/route.ts" },
  { route: "/api/client/settings", file: "src/app/api/client/settings/route.ts" },
  { route: "/api/client/account/password", file: "src/app/api/client/account/password/route.ts" },
  { route: "/api/client/integrations", file: "src/app/api/client/integrations/route.ts" },
  { route: "/api/client/integrations/test", file: "src/app/api/client/integrations/test/route.ts" },

  { route: "/api/chat", file: "src/app/api/chat/route.ts" },
  { route: "/api/leads", file: "src/app/api/leads/route.ts" },
  { route: "/api/widget/settings", file: "src/app/api/widget/settings/route.ts" },
  { route: "/api/widget/events", file: "src/app/api/widget/events/route.ts" },
];

const qaItems = [
  "Admin can log in",
  "Admin can open System Dashboard",
  "Admin can open Businesses",
  "Admin can open Onboarding",
  "Admin can open Widget Sites",
  "Admin can open Client Users",
  "Admin can open Settings",
  "Admin can open Analytics",
  "Client can log in",
  "Client can open Dashboard",
  "Client can open Widget Sites",
  "Client can open Analytics",
  "Client can open Integrations",
  "Widget settings API can resolve siteId",
  "Leads API exists",
  "CSV exports exist",
];

function repoRoot() {
  return process.cwd();
}

function summarizeStatus(items: HealthItem[]): HealthStatus {
  if (items.some((item) => item.status === "error")) return "error";
  if (items.some((item) => item.status === "warning")) return "warning";
  return "ok";
}

function fileCheck(item: { route: string; file: string }): HealthItem {
  const fullPath = path.join(repoRoot(), item.file);
  const exists = existsSync(fullPath);

  return {
    name: item.route,
    status: exists ? "ok" : "error",
    message: exists ? "File exists" : "Missing route file",
    detail: item.file,
  };
}

export async function getSystemHealth(): Promise<SystemHealth> {
  const envItems: HealthItem[] = [
    ...requiredEnv.map((name) => ({
      name,
      status: process.env[name] ? "ok" as const : "error" as const,
      message: process.env[name] ? "Configured" : "Missing required environment variable",
    })),
    ...optionalEnv.map((name) => ({
      name,
      status: process.env[name] ? "ok" as const : "warning" as const,
      message: process.env[name] ? "Configured" : "Optional but not configured",
    })),
  ];

  const supabase = getSupabaseAdmin();
  const tableItems: HealthItem[] = [];

  if (!supabase) {
    for (const table of tableChecks) {
      tableItems.push({ name: table, status: "error", message: "Supabase admin client is not configured" });
    }
  } else {
    for (const table of tableChecks) {
      try {
        const { error, count } = await supabase.from(table).select("*", { count: "exact", head: true });
        tableItems.push({
          name: table,
          status: error ? "error" : "ok",
          message: error ? error.message : "Reachable",
          detail: error ? undefined : `Rows: ${count ?? "unknown"}`,
        });
      } catch (error) {
        tableItems.push({
          name: table,
          status: "error",
          message: error instanceof Error ? error.message : "Unknown table check error",
        });
      }
    }
  }

  const routeItems = routeFileChecks.map(fileCheck);
  const apiRouteItems = apiRouteFileChecks.map(fileCheck);

  const qaChecklist: HealthItem[] = qaItems.map((name) => ({
    name,
    status: "warning",
    message: "Manual test recommended",
  }));

  const allItems = [...envItems, ...tableItems, ...routeItems, ...apiRouteItems];

  return {
    checkedAt: new Date().toISOString(),
    overallStatus: summarizeStatus(allItems),
    env: envItems,
    tables: tableItems,
    routes: routeItems,
    apiRoutes: apiRouteItems,
    qaChecklist,
  };
}
