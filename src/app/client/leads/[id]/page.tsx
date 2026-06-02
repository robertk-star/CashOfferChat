import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { clientCookieName, verifyClientSessionToken } from "@/lib/clientAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Client Lead Detail | CashOfferChat" };

type Message = {
  id: string;
  created_at: string;
  role: string;
  content: string;
};

export default async function ClientLeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(clientCookieName())?.value;
  const session = verifyClientSessionToken(token);
  if (!session) redirect("/client/login");

  const supabase = getSupabaseAdmin();
  if (!supabase) notFound();

  const { data: lead } = await supabase
    .from("seller_leads")
    .select("*")
    .eq("id", id)
    .eq("business_id", session.businessId)
    .maybeSingle();

  if (!lead) notFound();

  let messages: Message[] = [];
  if (lead.conversation_id) {
    const { data } = await supabase
      .from("conversation_messages")
      .select("id, created_at, role, content")
      .eq("conversation_id", lead.conversation_id)
      .order("created_at", { ascending: true });
    messages = (data || []) as Message[];
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <Link href="/client" className="text-sm font-bold text-slate-500 underline">Back to Client Dashboard</Link>
            <h1 className="mt-2 text-2xl font-bold text-navy">{lead.name || "Seller Lead"}</h1>
            <p className="text-sm text-slate-500">{new Date(lead.created_at).toLocaleString()}</p>
          </div>
          <form action="/api/client/logout" method="post">
            <button className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-navy">
              Log Out
            </button>
          </form>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[1fr_.9fr]">
        <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
          <h2 className="text-xl font-bold text-navy">Lead Details</h2>
          <dl className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              ["Status", lead.status],
              ["Name", lead.name],
              ["Phone", lead.phone],
              ["Email", lead.email],
              ["Property Address", lead.property_address],
              ["City", lead.property_city],
              ["Timeline", lead.timeline],
              ["Situation", lead.situation],
              ["Condition", lead.property_condition],
              ["Source URL", lead.source_url],
            ].map(([label, value]) => (
              <div key={label as string} className="rounded-2xl bg-slate-50 p-4">
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</dt>
                <dd className="mt-1 break-words text-sm font-semibold text-navy">{value || "—"}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 rounded-2xl bg-slate-50 p-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">Seller Notes</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{lead.notes || "—"}</p>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
          <h2 className="text-xl font-bold text-navy">Conversation Transcript</h2>
          <div className="mt-6 space-y-4">
            {messages.length === 0 && <p className="text-sm text-slate-500">No transcript available.</p>}
            {messages.map((message) => (
              <div key={message.id} className={message.role === "user" ? "rounded-2xl bg-gold/30 p-4" : "rounded-2xl bg-slate-100 p-4"}>
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">{message.role === "user" ? "Seller" : "Assistant"}</div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{message.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
