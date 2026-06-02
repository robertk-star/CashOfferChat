import Link from "next/link";

export function AdminOnboardingLink() {
  return (
    <Link className="rounded-full bg-gold px-5 py-2 text-sm font-bold text-navy" href="/admin/onboarding">
      Onboard Business
    </Link>
  );
}
