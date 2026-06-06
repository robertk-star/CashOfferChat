import Script from "next/script";
import Link from "next/link";
import { PublicSiteHeader } from "@/components/PublicSiteHeader";
import { PublicSiteFooter } from "@/components/PublicSiteFooter";

export const metadata = {
  title: "Demo | CashOfferChat",
  description: "Try the CashOfferChat widget demo.",
};

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-white">
      <PublicSiteHeader />

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-black tracking-tight text-navy">Try the CashOfferChat widget.</h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            The demo widget is loaded in the bottom-right corner. Ask a question or click the quote button to enter house information.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            ["Ask a question", "Try “Do you buy as-is?” or “How fast can I close?”"],
            ["Open the form", "Click “Enter House Info for a Quote” to test structured intake."],
            ["Submit a test lead", "Use test information and confirm it appears in the dashboard."],
          ].map(([title, text]) => (
            <div key={title} className="rounded-[2rem] bg-slate-50 p-6 ring-1 ring-slate-200">
              <h2 className="text-xl font-black text-navy">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-[2rem] bg-slate-950 p-8 text-white">
          <h2 className="text-2xl font-black">Demo embed code</h2>
          <p className="mt-2 text-sm text-slate-300">This is the style of embed code customers will install.</p>
          <pre className="mt-4 overflow-x-auto rounded-xl bg-white/10 p-4 text-xs">{`<script src="https://cashofferchat.com/widget.js" data-site-id="demo"></script>`}</pre>
        </div>

        <div className="mt-10">
          <Link href="/contact" className="rounded-full bg-gold px-7 py-4 font-black text-navy">Request Early Access</Link>
        </div>
      </section>

      <PublicSiteFooter />
      <Script src="/widget.js" strategy="afterInteractive" data-site-id="demo" />
    </main>
  );
}
