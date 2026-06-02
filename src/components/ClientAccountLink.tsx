import Link from "next/link";

export function ClientAccountLink() {
  return (
    <Link className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-navy" href="/client/account">
      Account
    </Link>
  );
}
