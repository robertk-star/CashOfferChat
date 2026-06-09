import Link from "next/link";
import { PublicSiteHeader } from "@/components/PublicSiteHeader";
import { PublicSiteFooter } from "@/components/PublicSiteFooter";

const features = [
  ["Answers seller questions", "Handles common questions about as-is sales, repairs, fees, closing timelines, tenants, inherited homes, and next steps."],
  ["Captures lead details", "Collects name, phone, email, property city, address, situation, timeline, and notes through a structured quote form."],
  ["Sends lead notifications", "New leads save in the dashboard and can send email notifications to the business owner or active client users."],
  ["Works on existing sites", "Install the widget with one script tag. No full website rebuild is required."],
  ["Customizable widget", "Change the title, subtitle, buttons, colors, phone display, and approved FAQ answers."],
  ["Client dashboard included", "Clients can review leads, update settings, copy the embed script, and manage their widget."],
];

const pricingPlans = [
  {
    name: "Starter",
    price: "$49/mo",
    label: "1 widget site",
    text: "Everything included for one cash home buyer website.",
  },
  {
    name: "Pro",
    price: "$99/mo",
    label: "Up to 4 sites/accounts",
    text: "Everything included for buyers or agencies managing multiple sites or accounts.",
  },
];

const faqs = [
  ["Is CashOfferChat just a chatbot?", "No. It combines AI-style seller Q&A with a structured property intake form, lead dashboard, widget settings, and lead notifications."],
  ["Does it make offers automatically?", "No. It does not promise prices or make binding offers. It collects property information so the buying team can review the lead."],
  ["Can each company customize it?", "Yes. Each business can customize the widget text, colors, phone display, FAQ answers, and business settings."],
  ["Can I see a live demo?", "Yes. The live demo site is sellmyhousetodayanywhere.com."],
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <PublicSiteHeader />

      <section className="bg-gradient-to-br from-slate-50 via-white to-amber-50">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <div>
            <div className="mb-5 inline-flex rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-amber-900">
              Built for cash home buyers and motivated seller websites
            </div>
            <h1 className="text-5xl font-black leading-tight tracking-tight text-navy md:text-6xl">
              Turn more seller website visitors into leads.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              CashOfferChat answers seller questions, opens a house-info form, captures lead details, and sends the lead to your team.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="https://www.sellmyhousetodayanywhere.com/" className="rounded-full bg-gold px-7 py-4 text-base font-black text-navy shadow-soft">
                View Live Demo Site
              </Link>
              <Link href="/contact" className="rounded-full border border-slate-300 bg-white px-7 py-4 text-base font-black text-navy">
                Request Early Access
              </Link>
            </div>
          </div>

          <div className="rounded-[2.5rem] bg-white p-5 shadow-soft ring-1 ring-slate-200">
            <div className="rounded-[2rem] bg-slate-950 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-black">Seller Intake Assistant</div>
                  <div className="text-sm text-slate-300">Live demo conversation</div>
                </div>
                <div className="rounded-full bg-gold px-3 py-1 text-xs font-black text-navy">LIVE DEMO</div>
              </div>
              <div className="mt-6 space-y-4">
                <div className="max-w-[85%] rounded-2xl bg-white/10 p-4 text-sm leading-6">Hi! I can answer questions and help collect property details for a quote review.</div>
                <div className="ml-auto max-w-[85%] rounded-2xl bg-gold p-4 text-sm font-semibold leading-6 text-navy">Do you buy houses that need repairs?</div>
                <div className="max-w-[85%] rounded-2xl bg-white/10 p-4 text-sm leading-6">Yes. You can enter your house information so the team can review the property.</div>
              </div>
              <div className="mt-6 rounded-2xl bg-gold p-4 text-center font-black text-navy">Enter House Info for a Quote</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="max-w-3xl text-4xl font-black tracking-tight text-navy">Built for the seller lead flow, not generic website chat.</h2>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">Motivated sellers often have questions before they submit a form. CashOfferChat helps answer those questions and moves ready sellers into a structured intake form.</p>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map(([title, text]) => (
            <div key={title} className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
              <h3 className="text-xl font-black text-navy">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="text-4xl font-black text-navy">How it works</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-4">
            {[
              ["1", "Create profile", "Add the business details and widget settings."],
              ["2", "Install widget", "Copy one script tag to the customer website."],
              ["3", "Capture leads", "The widget answers questions and opens the quote form."],
              ["4", "Follow up", "Leads save in the dashboard and can trigger email notifications."],
            ].map(([number, title, text]) => (
              <div key={number} className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-gold font-black text-navy">{number}</div>
                <h3 className="font-black text-navy">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <h2 className="text-4xl font-black text-navy">See the widget on a real demo site.</h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">Open the widget in the bottom-right corner. Ask a seller question or click the quote button to see the intake flow.</p>
            <Link href="https://www.sellmyhousetodayanywhere.com/" className="mt-6 inline-flex rounded-full bg-gold px-7 py-4 font-black text-navy">View Live Demo Site</Link>
          </div>
          <div className="rounded-[2rem] bg-slate-50 p-8 ring-1 ring-slate-200">
            <h3 className="text-2xl font-black text-navy">What the demo should show</h3>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
              <li>✓ Clear quote/intake button</li>
              <li>✓ Seller FAQ answers</li>
              <li>✓ Structured lead capture</li>
              <li>✓ Lead data ready for dashboard and email delivery</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="text-4xl font-black">Simple pricing</h2>
          <p className="mt-4 max-w-2xl text-slate-300">Two early-access plans. Both include the full widget, dashboard, settings, FAQs, and lead email notifications.</p>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {pricingPlans.map((plan) => (
              <div key={plan.name} className="rounded-[2rem] bg-white/10 p-6 ring-1 ring-white/10">
                <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-300">{plan.label}</div>
                <h3 className="mt-4 text-2xl font-black">{plan.name}</h3>
                <div className="mt-4 text-4xl font-black text-gold">{plan.price}</div>
                <p className="mt-4 text-sm leading-6 text-slate-300">{plan.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-20">
        <h2 className="text-4xl font-black text-navy">FAQ</h2>
        <div className="mt-8 space-y-4">
          {faqs.map(([q, a]) => (
            <details key={q} className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-200">
              <summary className="cursor-pointer font-black text-navy">{q}</summary>
              <p className="mt-3 text-sm leading-6 text-slate-600">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="bg-amber-50">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="text-4xl font-black text-navy">Ready to test CashOfferChat?</h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">See the widget running on a real home buyer demo site, then install it on your own website.</p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="https://www.sellmyhousetodayanywhere.com/" className="rounded-full bg-gold px-7 py-4 font-black text-navy">View Live Demo Site</Link>
            <Link href="/contact" className="rounded-full border border-slate-300 bg-white px-7 py-4 font-black text-navy">Request Early Access</Link>
          </div>
        </div>
      </section>

      <PublicSiteFooter />
    </main>
  );
}
