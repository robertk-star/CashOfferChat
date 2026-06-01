import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { adminCookieName, verifyAdminSessionToken } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Lead Detail | CashOfferChat" };

const statusOptions = [
  ["new", "New"],
  ["contacted", "Contacted"],
  ["appointment_set", "Appointment Set"],
  ["offer_made", "Offer Made"],
  ["under_contract", "Under Contract"],
  ["closed", "Closed"],
  ["not_interested", "Not Interested"],
  ["bad_lead", "Bad Lead"],
  ["referral", "Referral"],
];

type Lead = {
  id: string;
  conversation_id: string | null;
  created_at: string;
  updated_at: string;
  status: string | null;
  name: string | null;
  phone: string | null;
  email: string | null;
  property_address: string | null;
  property_city: string | null;
  timeline: string | null;
  situation: string | null;
  property_condition: string | null;
  notes: string | null;
  admin_notes: string | null;
  last_contacted_at: string | null;
  source_url: string | null;
  notification_sent_at: string | null;
  notification_error: string | null;
};

type Message = {
  id: string;
  created_at: string;
  role: "user" | "assistant" | "system";
  content: string;
};

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 whitespace-pre-wrap text-sm font-medium text-navy">{value || "—"}</p>
    </div>
  );
}

export default async function LeadDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName())?.value;
  if (!verifyAdminSessionToken(token)) redirect("/admin/login");

  const { id } = await params;
  const query = await searchParams;
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-5xl rounded-3xl bg-amber-50 p-6 text-amber-800">Supabase is not configured.</div>
      </main>
    );
  }

  const { data: lead, error } = await supabase
    .from("seller_leads")
    .select("id, conversation_id, created_at, updated_at, status, name, phone, email, property_address, property_city, timeline, situation, property_condition, notes, admin_notes, last_contacted_at, source_url, notification_sent_at, notification_error")
    .eq("id", id)
    .single();

  if (error || !lead) notFound();

  let messages: Message[] = [];
  if ((lead as Lead).conversation_id) {
    const { data } = await supabase
      .from("conversation_messages")
      .select("id, created_at, role, content")
      .eq("conversation_id", (lead as Lead).conversation_id)
      .order("created_at", { ascending: true });
    messages = (data || []) as Message[];
  }

  const typedLead = lead as Lead;

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <Link className="text-sm font-semibold text-slate-500" href="/admin">← Back to Leads</Link>
            <h1 className="mt-2 text-2xl font-bold text-navy">{typedLead.name || "Seller Lead"}</h1>
            <p className="text-sm text-slate-500">Created {new Date(typedLead.created_at).toLocaleString()}</p>
          </div>
          <Link className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-navy" href="/admin/settings">Settings</Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          {query.saved && <div className="rounded-2xl bg-green-50 p-4 text-sm font-semibold text-green-800">Lead updated.</div>}
          {query.error && <div className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">Could not update the lead. Please try again.</div>}

          <section>
            <h2 className="mb-4 text-xl font-bold text-navy">Seller & Property Details</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Name" value={typedLead.name} />
              <Field label="Phone" value={typedLead.phone} />
              <Field label="Email" value={typedLead.email} />
              <Field label="Status" value={(typedLead.status || "new").replaceAll("_", " ")} />
              <Field label="Property Address" value={typedLead.property_address} />
              <Field label="City" value={typedLead.property_city} />
              <Field label="Timeline" value={typedLead.timeline} />
              <Field label="Situation" value={typedLead.situation} />
              <Field label="Property Condition" value={typedLead.property_condition} />
              <Field label="Source URL" value={typedLead.source_url} />
              <Field label="Notification Sent" value={typedLead.notification_sent_at ? new Date(typedLead.notification_sent_at).toLocaleString() : "Not sent"} />
              <Field label="Notification Error" value={typedLead.notification_error} />
            </div>
            <div className="mt-4">
              <Field label="Seller Notes" value={typedLead.notes} />
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-bold text-navy">Conversation Transcript</h2>
            <div className="rounded-[2rem] bg-white p-5 shadow-soft ring-1 ring-slate-200">
              {messages.length === 0 && <p className="text-sm text-slate-500">No conversation transcript is connected to this lead.</p>}
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={message.role === "user" ? "ml-auto max-w-2xl rounded-2xl bg-gold px-4 py-3 text-navy" : "max-w-2xl rounded-2xl bg-slate-100 px-4 py-3 text-slate-700"}>
                    <div className="mb-1 text-xs font-bold uppercase tracking-wide opacity-60">{message.role === "user" ? "Seller" : "Assistant"} · {new Date(message.created_at).toLocaleString()}</div>
                    <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <form action={`/api/admin/leads/${typedLead.id}`} method="post" className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-navy">Manage Lead</h2>
            <label className="mt-5 block text-sm font-semibold text-slate-700">
              Status
              <select name="status" defaultValue={typedLead.status || "new"} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-gold">
                {statusOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="mt-5 block text-sm font-semibold text-slate-700">
              Internal Admin Notes
              <textarea name="admin_notes" defaultValue={typedLead.admin_notes || ""} rows={9} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-gold" placeholder="Called seller, appointment notes, follow-up reminders, etc." />
            </label>
            <label className="mt-4 flex items-center gap-3 text-sm font-semibold text-slate-700">
              <input name="mark_contacted" type="checkbox" className="h-4 w-4" />
              Mark contacted now
            </label>
            <p className="mt-3 text-xs text-slate-500">Last contacted: {typedLead.last_contacted_at ? new Date(typedLead.last_contacted_at).toLocaleString() : "Not marked yet"}</p>
            <button className="mt-6 w-full rounded-full bg-navy px-5 py-3 font-bold text-white" type="submit">Save Lead</button>
          </form>
        </aside>
      </section>
    </main>
  );
}
