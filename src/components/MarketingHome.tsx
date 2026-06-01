import Link from "next/link";

const features = [
  "Answers seller questions",
  "Collects property details",
  "Captures contact information",
  "Qualifies timeline and motivation",
  "Works after hours",
  "Stores leads for follow-up",
];

export function MarketingHome() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="font-bold text-xl text-navy">CashOfferChat</div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#features">Features</a>
            <a href="#demo">Demo</a>
            <a href="#pricing">Pricing</a>
            <Link className="rounded-full bg-navy px-5 py-2 text-white" href="/demo">View Demo</Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
        <div>
          <p className="mb-5 inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800">
            Built for cash home buyer websites
          </p>
          <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-navy md:text-6xl">
            AI chat that helps turn seller website visitors into qualified leads.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            CashOfferChat answers seller questions, collects property details, and helps capture motivated seller inquiries around the clock.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a className="rounded-full bg-gold px-7 py-4 text-center font-bold text-navy shadow-soft" href="#early-access">
              Request Early Access
            </a>
            <Link className="rounded-full border border-slate-300 bg-white px-7 py-4 text-center font-bold text-navy" href="/demo">
              View We Buy Houses Demo
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-500">Lead capture and qualification software. No lead or deal guarantees.</p>
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-soft ring-1 ring-slate-200">
          <div className="rounded-3xl bg-navy p-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="font-bold">Seller Intake Assistant</p>
                <p className="text-xs text-white/60">Usually replies instantly</p>
              </div>
              <span className="rounded-full bg-green px-3 py-1 text-xs font-bold">Online</span>
            </div>
            <div className="space-y-4 py-6">
              <div className="max-w-[85%] rounded-2xl bg-white px-4 py-3 text-sm text-slate-700">
                Hi! I can answer questions about selling your house as-is for cash. What city is the property in?
              </div>
              <div className="ml-auto max-w-[75%] rounded-2xl bg-gold px-4 py-3 text-sm font-medium text-navy">Austin</div>
              <div className="max-w-[85%] rounded-2xl bg-white px-4 py-3 text-sm text-slate-700">
                Great. What best describes your timeline: ASAP, within 30 days, 1–3 months, or just exploring?
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold text-navy md:text-4xl">Motivated sellers often have questions before they fill out a form.</h2>
            <p className="mt-4 text-lg text-slate-600">
              They want to know if repairs matter, how fast closing can happen, whether tenants are a problem, and what happens after they ask for an offer. CashOfferChat gives them a helpful first response and guides them toward follow-up.
            </p>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-5 md:grid-cols-3">
          {features.map((feature) => (
            <div key={feature} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 font-bold text-amber-700">✓</div>
              <h3 className="text-xl font-bold text-navy">{feature}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">Designed specifically for seller intake conversations on cash home buyer websites.</p>
            </div>
          ))}
        </div>
      </section>

      <section id="demo" className="bg-navy py-20 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-4xl font-bold">See the We Buy Houses demo flow.</h2>
            <p className="mt-5 text-lg leading-8 text-white/70">
              The Phase 1 demo is built around a single cash home buyer use case, then can later become a multi-company subscription platform.
            </p>
            <Link className="mt-8 inline-flex rounded-full bg-gold px-7 py-4 font-bold text-navy" href="/demo">Open Demo Chat</Link>
          </div>
          <div className="rounded-[2rem] bg-white p-5 text-slate-900">
            <p className="chat-bubble-assistant">Do you buy houses that need repairs?</p>
            <p className="chat-bubble-user">The roof is old and the inside needs work.</p>
            <p className="chat-bubble-assistant">Many cash buyers purchase houses as-is. What timeline are you hoping for?</p>
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="text-center text-4xl font-bold text-navy">Pricing preview</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            ["Starter", "For one website"],
            ["Growth", "For active buyers"],
            ["Pro", "For teams and multi-market buyers"],
          ].map(([name, text]) => (
            <div key={name} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <h3 className="text-2xl font-bold text-navy">{name}</h3>
              <p className="mt-3 text-slate-600">{text}</p>
              <p className="mt-8 text-3xl font-bold text-navy">Coming Soon</p>
            </div>
          ))}
        </div>
      </section>

      <section id="early-access" className="bg-white py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-4xl font-bold text-navy">Want to test CashOfferChat on your home buying website?</h2>
          <p className="mt-5 text-lg text-slate-600">Phase 1 is focused on proving the seller intake flow before adding billing, multi-client settings, and CRM integrations.</p>
          <Link className="mt-8 inline-flex rounded-full bg-gold px-7 py-4 font-bold text-navy" href="/demo">Try the Demo</Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-slate-50 py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>© CashOfferChat. Lead intake software for cash home buyer websites.</p>
          <div className="flex gap-5"><a href="#features">Product</a><a href="#pricing">Pricing</a><Link href="/admin/login">Admin</Link></div>
        </div>
      </footer>
    </main>
  );
}
