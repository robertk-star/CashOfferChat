import Link from "next/link";

export function AdminPhase3Links() {
  return (
    <div className="mb-6 flex flex-wrap gap-3">
      <Link className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-bold text-navy" href="/admin/sites">
        Widget Sites
      </Link>
      <Link className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-bold text-navy" href="/admin/clients">
        Client Users
      </Link>
      <Link className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-bold text-navy" href="/admin/analytics">
        Analytics
      </Link>
      <Link className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-bold text-navy" href="/admin/settings">
        Settings
      </Link>
    </div>
  );
}
