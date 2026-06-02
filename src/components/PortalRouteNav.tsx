"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const adminLinks = [
  { href: "/admin", label: "Admin Dashboard" },
  { href: "/admin/businesses", label: "Businesses" },
  { href: "/admin/onboarding", label: "Onboarding" },
  { href: "/admin/sites", label: "Widget Sites" },
  { href: "/admin/clients", label: "Client Users" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/system", label: "System" },
];

const clientLinks = [
  { href: "/client", label: "Client Dashboard" },
  { href: "/client/settings", label: "Settings" },
  { href: "/client/account", label: "Account" },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  if (href === "/client") return pathname === "/client";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PortalRouteNav() {
  const pathname = usePathname() || "";

  const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isClientRoute = pathname.startsWith("/client") && pathname !== "/client/login";

  if (!isAdminRoute && !isClientRoute) return null;

  const links = isAdminRoute ? adminLinks : clientLinks;
  const logoutAction = isAdminRoute ? "/api/admin/logout" : "/api/client/logout";
  const label = isAdminRoute ? "CashOfferChat Admin" : "CashOfferChat Client Portal";

  return (
    <div className="border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-sm font-bold uppercase tracking-wide text-slate-500">{label}</div>
            <div className="text-xs text-slate-400">Current route: {pathname}</div>
          </div>

          <form action={logoutAction} method="post">
            <button
              className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
              type="submit"
            >
              Log Out
            </button>
          </form>
        </div>

        <nav className="mt-4 flex flex-wrap gap-2">
          {links.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  active
                    ? "rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white"
                    : "rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-white"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
