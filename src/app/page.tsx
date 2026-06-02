import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-20">
      <div className="mx-auto max-w-4xl rounded-[2rem] bg-white p-10 shadow-soft ring-1 ring-slate-200">
        <p className="mb-4 inline-flex rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800">
          CashOfferChat
        </p>
        <h1 className="text-4xl font-bold text-navy">AI seller intake assistant for cash home buyer websites.</h1>
        <p className="mt-5 text-lg text-slate-600">
          Capture seller questions, collect property details, and send leads to the right business account.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/admin/login" className="rounded-full bg-gold px-6 py-3 font-bold text-navy">Admin Login</Link>
          <Link href="/admin/businesses" className="rounded-full border border-slate-300 px-6 py-3 font-bold text-navy">Businesses</Link>
        </div>
      </div>
    </main>
  );
}
