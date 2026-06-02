import Link from "next/link";
import { PublicSiteHeader } from "@/components/PublicSiteHeader";
import { PublicSiteFooter } from "@/components/PublicSiteFooter";

export const metadata = {
  title: "Pricing | CashOfferChat",
  description: "CashOfferChat pricing preview.",
};

const plans = [
  {
    name: "Starter",
    price: "$149/mo",
    features: ["1 widget site", "Lead dashboard", "Business settings", "CSV lead export", "Basic analytics"],
  },
  {
    name: "Growth",
    price: "$249/mo",
    features: ["Everything in Starter", "Advanced analytics", "Custom FAQs", "Webhook delivery", "Integration testing"],
  },
  {
    name: "Pro",
    price: "$399/mo",
    features: ["Multiple sites", "Priority onboarding", "Advanced routing support", "CRM setup help", "Multi-market support"],
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white">
      <PublicSiteHeader />
      <section className="mx-auto max-w-7xl px-6 py-20">
        <h1 className="text-5xl font-black text-navy">Pricing preview</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
          Billing is not active yet. These are draft subscription packages for early customer conversations.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.name} className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
              <h2 className="text-2xl font-black text-navy">{plan.name}</h2>
              <div className="mt-4 text-4xl font-black text-navy">{plan.price}</div>
              <ul className="mt-6 space-y-3 text-sm text-slate-600">
                {plan.features.map((feature) => <li key={feature}>✓ {feature}</li>)}
              </ul>
              <Link href="/contact" className="mt-7 inline-flex rounded-full bg-gold px-6 py-3 font-black text-navy">
                Request Access
              </Link>
            </div>
          ))}
        </div>
      </section>
      <PublicSiteFooter />
    </main>
  );
}
