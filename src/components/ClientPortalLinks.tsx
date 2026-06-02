import Link from "next/link";

export function ClientPortalLinks() {
  return (
    <div className="mb-6 flex flex-wrap gap-3">
      <Link className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-bold text-navy" href="/client">
        Leads
      </Link>
      <Link className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-bold text-navy" href="/client/settings">
        Settings
      </Link>
      <Link className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-bold text-navy" href="/client/account">
        Account
      </Link>
    </div>
  );
}
