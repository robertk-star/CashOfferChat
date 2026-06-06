import Script from "next/script";
import { buildWidgetScriptSrc } from "@/lib/widgetEmbed";
import Link from "next/link";
import { PublicSiteHeader } from "@/components/PublicSiteHeader";
import { PublicSiteFooter } from "@/components/PublicSiteFooter";

const features = [
  {
    title: "Answers seller questions",
    text: "Handles common questions about as-is sales, timelines, repairs, fees, tenants, and next steps.",
  },
  {
    title: "Captures better lead details",
    text: "Uses a structured quote form so seller name, phone, property city, address, situation, and timeline are captured cleanly.",
  },
  {
    title: "Works on existing websites",
    text: "Add the widget to a cash home buyer website with a simple script tag.",
  },
  {
    title: "Client dashboard included",
    text: "Clients can view leads, update statuses, export CSVs, review analytics, and manage widget settings.",
  },
  {
    title: "FAQ and business settings",
    text: "Each business can control service areas, what they buy, what they do not buy, FAQs, and AI instructions.",
  },
  {
    title: "Webhook-ready",
    text: "Send leads to Zapier, Make, GoHighLevel, or another CRM using webhook delivery.",
  },
];

const faqs = [
  {
    q: "Is CashOfferChat just a chatbot?",
    a: "No. It combines AI question-answering with a structured seller intake form, lead dashboard, analytics, exports, and integration tools.",
  },
  {
    q: "Can it be used on any cash home buyer website?",
    a: "Yes. The widget is designed to be embedded on existing websites using a script tag.",
  },
  {
    q: "Does it make cash offers automatically?",
    a: "No. CashOfferChat does not make offers or promise prices. It collects property information so the buying team can review the lead.",
  },
  {
    q: "Can each company customize the answers?",
    a: "Yes. Each business can manage service areas, buying criteria, FAQs, widget text, and AI guidance.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <PublicSiteHeader />

      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-amber-50">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <div>
            <div className="mb-5 inline-flex rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-amber-900">
              Built for cash home buyers and motivated seller websites
            </div>
            <h1 className="text-5xl font-black leading-tight tracking-tight text-navy md:text-6xl">
              AI chat that helps turn seller website visitors into qualified leads.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              CashOfferChat answers seller questions, opens a structured house-info form, captures lead details, and sends the lead to your team.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/demo" className="rounded-full bg-gold px-7 py-4 text-base font-black text-navy shadow-soft">
                View Demo
              </Link>
              <Link href="/contact" className="rounded-full border border-slate-300 bg-white px-7 py-4 text-base font-black text-navy">
                Request Early Access
              </Link>
            </div>

            <div className="mt-8 grid gap-3 text-sm font-semibold text-slate-600 sm:grid-cols-2">
              <div>✓ Capture leads 24/7</div>
              <div>✓ No offer promises</div>
              <div>✓ Built-in FAQ controls</div>
              <div>✓ Client dashboard included</div>
            </div>
          </div>

          <div className="rounded-[2.5rem] bg-white p-5 shadow-soft ring-1 ring-slate-200">
            <div className="rounded-[2rem] bg-slate-950 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-black">Seller Intake Assistant</div>
                  <div className="text-sm text-slate-300">Demo conversation</div>
                </div>
                <div className="rounded-full bg-gold px-3 py-1 text-xs font-black text-navy">LIVE DEMO</div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="max-w-[85%] rounded-2xl bg-white/10 p-4 text-sm leading-6">
                  Hi! I can answer questions about selling a house as-is and help collect property details for a quote review.
                </div>
                <div className="ml-auto max-w-[85%] rounded-2xl bg-gold p-4 text-sm font-semibold leading-6 text-navy">
                  Do you buy houses that need repairs?
                </div>
                <div className="max-w-[85%] rounded-2xl bg-white/10 p-4 text-sm leading-6">
                  Yes. Many cash buyers review houses as-is. If you want the team to review your property, you can enter house information for a quote.
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-gold p-4 text-center font-black text-navy">
                Enter House Info for a Quote
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="max-w-3xl">
          <h2 className="text-4xl font-black tracking-tight text-navy">Built for the seller lead flow, not generic website chat.</h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Motivated sellers often have questions before they submit a form. CashOfferChat helps answer those questions and moves ready sellers into a structured intake form.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
              <h3 className="text-xl font-black text-navy">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="text-4xl font-black text-navy">How it works</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-4">
            {[
              ["1", "Create a business profile", "Add service areas, phone number, buying criteria, FAQs, and widget settings."],
              ["2", "Install the widget", "Copy one script tag and add it to the customer website."],
              ["3", "Capture seller leads", "The widget answers questions and opens a structured house-info form."],
              ["4", "Work the lead", "Leads appear in the dashboard, can be exported, and can be sent by webhook."],
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
            <h2 className="text-4xl font-black text-navy">Try the demo widget.</h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Open the widget in the bottom-right corner. Ask a seller question or click the quote button to see the intake flow.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold text-slate-600">
              <span className="rounded-full bg-slate-100 px-4 py-2">“Do you buy as-is?”</span>
              <span className="rounded-full bg-slate-100 px-4 py-2">“How fast can I close?”</span>
              <span className="rounded-full bg-slate-100 px-4 py-2">“Can you look at my house?”</span>
            </div>
          </div>

          <div className="rounded-[2rem] bg-slate-50 p-8 ring-1 ring-slate-200">
            <h3 className="text-2xl font-black text-navy">What the demo should show</h3>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
              <li>✓ Clear quote/intake button</li>
              <li>✓ AI-style FAQ answers using business knowledge</li>
              <li>✓ Structured lead capture instead of unreliable free-text guessing</li>
              <li>✓ Lead data ready for dashboard, email, export, and webhook delivery</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="text-4xl font-black">Pricing preview</h2>
          <p className="mt-4 max-w-2xl text-slate-300">Final billing will be added later. These are placeholder plan concepts.</p>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              ["Starter", "$149/mo", "1 widget site, lead dashboard, basic settings, CSV export"],
              ["Growth", "$249/mo", "Analytics, integrations, custom FAQs, webhook delivery"],
              ["Pro", "$399/mo", "Multiple sites, advanced settings, priority setup support"],
            ].map(([plan, price, text]) => (
              <div key={plan} className="rounded-[2rem] bg-white/10 p-6 ring-1 ring-white/10">
                <h3 className="text-2xl font-black">{plan}</h3>
                <div className="mt-4 text-3xl font-black text-gold">{price}</div>
                <p className="mt-4 text-sm leading-6 text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-20">
        <h2 className="text-4xl font-black text-navy">FAQ</h2>
        <div className="mt-8 space-y-4">
          {faqs.map((faq) => (
            <details key={faq.q} className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-200">
              <summary className="cursor-pointer font-black text-navy">{faq.q}</summary>
              <p className="mt-3 text-sm leading-6 text-slate-600">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="bg-amber-50">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="text-4xl font-black text-navy">Ready to test CashOfferChat?</h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Start with a demo site, install the widget, and capture your first test seller lead.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/demo" className="rounded-full bg-gold px-7 py-4 font-black text-navy">View Demo</Link>
            <Link href="/contact" className="rounded-full border border-slate-300 bg-white px-7 py-4 font-black text-navy">Request Early Access</Link>
          </div>
        </div>
      </section>

      <PublicSiteFooter />

      <Script src={buildWidgetScriptSrc()} strategy="afterInteractive" data-site-id="demo" />
    </main>
  );
}
