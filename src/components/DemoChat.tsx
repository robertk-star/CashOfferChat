"use client";

import { FormEvent, useMemo, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };
type Intake = {
  name?: string;
  phone?: string;
  email?: string;
  propertyAddress?: string;
  propertyCity?: string;
  timeline?: string;
  situation?: string;
  propertyCondition?: string;
};

const starters = [
  "Do you buy as-is?",
  "How fast can I close?",
  "My house needs repairs",
  "I have tenants",
  "I want a cash offer",
];

const fieldLabels: Array<[keyof Intake, string]> = [
  ["propertyCity", "City"],
  ["propertyAddress", "Address"],
  ["situation", "Situation"],
  ["timeline", "Timeline"],
  ["propertyCondition", "Condition"],
  ["name", "Name"],
  ["phone", "Phone"],
  ["email", "Email"],
];

export function DemoChat() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I can answer questions about selling an Austin-area house as-is for cash and collect a few details for follow-up. What city is the property in?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [intake, setIntake] = useState<Intake>({});
  const [leadId, setLeadId] = useState<string | null>(null);
  const [leadStatus, setLeadStatus] = useState<string | null>(null);
  const [manualLead, setManualLead] = useState({ name: "", phone: "", email: "", propertyAddress: "", propertyCity: "", timeline: "", situation: "" });

  const completionCount = useMemo(() => fieldLabels.filter(([key]) => Boolean(intake[key])).length, [intake]);
  const canSubmitManualLead = useMemo(() => manualLead.name && manualLead.phone && (manualLead.propertyAddress || manualLead.propertyCity), [manualLead]);

  async function sendMessage(content: string) {
    const trimmed = content.trim();
    if (!trimmed || isLoading) return;
    setMessages((current) => [...current, { role: "user", content: trimmed }]);
    setInput("");
    setIsLoading(true);
    setLeadStatus(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, message: trimmed, sourceUrl: window.location.href, intake }),
      });
      const data = await response.json();
      if (data.conversationId) setConversationId(data.conversationId);
      if (data.intake) {
        setIntake((current) => ({ ...current, ...data.intake }));
        setManualLead((current) => ({ ...current, ...data.intake }));
      }
      if (data.leadCreated && data.leadId) {
        setLeadId(data.leadId);
        setLeadStatus("Lead automatically saved from the chat intake.");
      }
      setMessages((current) => [...current, { role: "assistant", content: data.reply || data.nextQuestion || "Thanks. What city is the property in?" }]);
    } catch {
      setMessages((current) => [...current, { role: "assistant", content: "Thanks. I can help collect the property details for follow-up. What city is the property in?" }]);
    } finally {
      setIsLoading(false);
    }
  }

  async function submitManualLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLeadStatus("Saving lead...");
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...manualLead, conversationId, sourceUrl: window.location.href }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Lead save failed");
      setLeadId(data.id);
      setLeadStatus("Lead saved for follow-up.");
    } catch {
      setLeadStatus("Lead could not be saved. Check Supabase environment variables and SQL migration.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a className="font-bold text-xl text-navy" href="/">CashOfferChat</a>
          <a className="rounded-full bg-gold px-5 py-2 text-sm font-bold text-navy" href="tel:5125989341">Demo Call CTA</a>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1fr_420px]">
        <div className="rounded-[2rem] bg-white p-5 shadow-soft ring-1 ring-slate-200">
          <div className="border-b border-slate-200 pb-4">
            <h1 className="text-2xl font-bold text-navy">We Buy Houses Seller Intake Demo</h1>
            <p className="mt-2 text-sm text-slate-600">Phase 2A guides the conversation, captures seller details, and automatically saves a lead when enough information is collected.</p>
          </div>

          <div className="h-[520px] space-y-4 overflow-y-auto py-6">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={message.role === "user" ? "chat-bubble-user" : "chat-bubble-assistant"}>{message.content}</div>
            ))}
            {isLoading && <div className="chat-bubble-assistant">Typing...</div>}
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {starters.map((starter) => (
              <button key={starter} onClick={() => sendMessage(starter)} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">{starter}</button>
            ))}
          </div>

          <form onSubmit={(event) => { event.preventDefault(); sendMessage(input); }} className="flex gap-3">
            <input value={input} onChange={(event) => setInput(event.target.value)} className="flex-1 rounded-full border border-slate-300 px-5 py-3 outline-none focus:border-gold" placeholder="Answer the question or ask about selling..." />
            <button className="rounded-full bg-navy px-6 py-3 font-bold text-white" type="submit">Send</button>
          </form>
        </div>

        <aside className="space-y-5">
          <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-navy">Captured Intake</h2>
                <p className="mt-2 text-sm text-slate-600">Fields update automatically from the chat conversation.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{completionCount}/8</span>
            </div>
            <div className="mt-5 space-y-3">
              {fieldLabels.map(([key, label]) => (
                <div key={key} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">{intake[key] || "Not captured yet"}</p>
                </div>
              ))}
            </div>
            {leadStatus && <p className="mt-4 rounded-xl bg-green/10 p-3 text-sm font-semibold text-navy">{leadStatus}</p>}
            {leadId && <p className="mt-2 text-xs text-slate-500">Lead ID: {leadId}</p>}
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <h2 className="text-lg font-bold text-navy">Manual Save Fallback</h2>
            <p className="mt-2 text-sm text-slate-600">Use this only if the chat does not capture enough information automatically.</p>
            <form onSubmit={submitManualLead} className="mt-5 space-y-3">
              {[
                ["name", "Name"],
                ["phone", "Phone"],
                ["email", "Email"],
                ["propertyAddress", "Property address"],
                ["propertyCity", "City"],
                ["timeline", "Timeline"],
                ["situation", "Situation"],
              ].map(([key, label]) => (
                <label key={key} className="block text-sm font-semibold text-slate-700">
                  {label}
                  <input value={manualLead[key as keyof typeof manualLead]} onChange={(event) => setManualLead((current) => ({ ...current, [key]: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-gold" />
                </label>
              ))}
              <button disabled={!canSubmitManualLead} className="w-full rounded-full bg-gold px-5 py-3 font-bold text-navy disabled:cursor-not-allowed disabled:opacity-50" type="submit">Save Lead Manually</button>
            </form>
          </div>
        </aside>
      </section>
    </main>
  );
}
