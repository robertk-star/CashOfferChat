import { existsSync } from "fs";
import path from "path";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export type HealthItem = {
  name: string;
  status: "ok" | "warning" | "error";
  message: string;
};

export type SystemHealth = {
  checkedAt: string;
  overallStatus: "ok" | "warning" | "error";
  env: HealthItem[];
  tables: HealthItem[];
  routes: HealthItem[];
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
  "OPENAI_API_KEY",
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
];

const routeFileChecks = [
  { route: "/", file: "src/app/page.tsx" },
  { route: "/admin", file: "src/app/admin/page.tsx" },
  { route: "/admin/login", file: "src/app/admin/login/page.tsx" },
  { route: "/admin/businesses", file: "src/app/admin/businesses/page.tsx" },
  { route: "/admin/onboarding", file: "src/app/admin/onboarding/page.tsx" },
  { route: "/admin/sites", file: "src/app/admin/sites/page.tsx" },
  { route: "/admin/clients", file: "src/app/admin/clients/page.tsx" },
  { route: "/admin/settings", file: "src/app/admin/settings/page.tsx" },
  { route: "/admin/analytics", file: "src/app/admin/analytics/page.tsx" },
  { route: "/admin/system", file: "src/app/admin/system/page.tsx" },
  { route: "/client/login", file: "src/app/client/login/page.tsx" },
  { route: "/client", file: "src/app/client/page.tsx" },
  { route: "/client/settings", file: "src/app/client/settings/page.tsx" },
  { route: "/client/account", file: "src/app/client/account/page.tsx" },
  { route: "/widget-demo", file: "src/app/widget-demo/page.tsx" },
  { route: "/widget.js", file: "public/widget.js" },
];

function repoRoot() {
  return process.cwd();
}

function summarizeStatus(items: HealthItem[]): "ok" | "warning" | "error" {
  if (items.some((item) => item.status === "error")) return "error";
  if (items.some((item) => item.status === "warning")) return "warning";
  return "ok";
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
        const { error } = await supabase.from(table).select("*", { count: "exact", head: true });
        tableItems.push({
          name: table,
          status: error ? "error" : "ok",
          message: error ? error.message : "Reachable",
        });
      } catch (error) {
        tableItems.push({ name: table, status: "error", message: error instanceof Error ? error.message : "Unknown table check error" });
      }
    }
  }

  const routeItems: HealthItem[] = routeFileChecks.map((item) => {
    const fullPath = path.join(repoRoot(), item.file);
    const exists = existsSync(fullPath);
    return {
      name: item.route,
      status: exists ? "ok" : "error",
      message: exists ? item.file : `Missing file: ${item.file}`,
    };
  });

  const allItems = [...envItems, ...tableItems, ...routeItems];
  return {
    checkedAt: new Date().toISOString(),
    overallStatus: summarizeStatus(allItems),
    env: envItems,
    tables: tableItems,
    routes: routeItems,
  };
}
