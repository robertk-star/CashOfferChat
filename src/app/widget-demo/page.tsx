import Script from "next/script";
import Link from "next/link";

export const metadata = { title: "Widget Demo | CashOfferChat" };

export default function WidgetDemoPage() {
  const appUrl = (process.env.APP_URL || "https://cashofferchat.com").replace(/\/$/, "");
  const embedCode = `<script src="${appUrl}/widget.js" data-site-id="demo"></script>`;

  return (
    <main className="min-h-screen bg-stone-50 text-slate-800">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="font-bold text-xl text-navy">Example Cash Home Buyer Site</div>
          <nav className="hidden gap-6 text-sm font-semibold text-slate-600 md:flex">
            <a href="#how">How It Works</a>
            <a href="#reviews">Reviews</a>
            <a href="#faq">FAQ</a>
          </nav>
          <a className="rounded-full bg-gold px-5 py-2 text-sm font-bold text-navy" href="tel:9725550100">Call Now</a>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
        <div>
          <p className="mb-4 inline-flex rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-amber-800">Widget preview page</p>
          <h1 className="text-5xl font-bold tracking-tight text-navy md:text-6xl">Sell your house fast for cash.</h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            This page simulates a cash home buyer website with the CashOfferChat widget installed. Use the chat bubble in the bottom-right corner to test Q&amp;A and structured intake.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a className="rounded-full bg-gold px-7 py-4 text-center font-bold text-navy shadow-soft" href="#offer">Request Cash Offer</a>
            <a className="rounded-full border border-slate-300 bg-white px-7 py-4 text-center font-bold text-navy" href="tel:9725550100">Call 972-555-0100</a>
          </div>
        </div>
        <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
          <h2 className="text-2xl font-bold text-navy">Example installation code</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">In Phase 2E, a business can install the widget by placing this script on their website.</p>
          <pre className="mt-5 overflow-x-auto rounded-2xl bg-slate-950 p-4 text-sm text-white"><code>{embedCode}</code></pre>
          <Link className="mt-5 inline-flex rounded-full border border-slate-300 px-5 py-3 text-sm font-bold text-navy" href="/admin/settings">Back to Settings</Link>
        </div>
      </section>

      <section id="how" className="bg-white py-16">
        <div className="mx-auto grid max-w-6xl gap-5 px-6 md:grid-cols-3">
          {[
            ["Tell us about the property", "Share the city, address, and a few basics."],
            ["Get a direct review", "The team can review the details and follow up."],
            ["Close on your timeline", "No repairs, no public showings, and no obligation."],
          ].map(([title, text]) => (
            <div key={title} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h3 className="text-xl font-bold text-navy">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="offer" className="mx-auto max-w-4xl px-6 py-16 text-center">
        <h2 className="text-4xl font-bold text-navy">Try the widget in the bottom-right corner.</h2>
        <p className="mt-4 text-lg text-slate-600">Ask: “Do you buy as-is?”, “How fast can I close?”, or “Can you take a look at it?”</p>
      </section>

      <footer className="border-t border-stone-200 bg-white py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>Example website for CashOfferChat widget testing.</p>
          <Link href="/admin/settings">Admin Settings</Link>
        </div>
      </footer>

      <Script src="/widget.js" strategy="afterInteractive" data-site-id="demo" />
    </main>
  );
}
