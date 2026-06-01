"use client";

import { FormEvent, useMemo, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

const starters = [
  "Do you buy as-is?",
  "How fast can I close?",
  "My house needs repairs",
  "I have tenants",
  "I want a cash offer",
];

export function DemoChat() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I can answer questions about selling an Austin-area house as-is for cash and collect a few details for follow-up. What would you like to know?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [lead, setLead] = useState({ name: "", phone: "", email: "", propertyAddress: "", propertyCity: "", timeline: "", situation: "" });
  const [leadStatus, setLeadStatus] = useState<string | null>(null);

  const canSubmitLead = useMemo(() => lead.name && lead.phone && (lead.propertyAddress || lead.propertyCity), [lead]);

  async function sendMessage(content: string) {
    const trimmed = content.trim();
    if (!trimmed || isLoading) return;
    setMessages((current) => [...current, { role: "user", content: trimmed }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, message: trimmed, sourceUrl: window.location.href }),
      });
      const data = await response.json();
      if (data.conversationId) setConversationId(data.conversationId);
      setMessages((current) => [...current, { role: "assistant", content: data.reply || "Thanks. What city is the property in?" }]);
    } catch {
      setMessages((current) => [...current, { role: "assistant", content: "Thanks. I can help collect the property details for follow-up. What city is the property in?" }]);
    } finally {
      setIsLoading(false);
    }
  }

  async function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLeadStatus("Saving lead...");
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...lead, conversationId, sourceUrl: window.location.href }),
      });
      if (!response.ok) throw new Error("Lead save failed");
      setLeadStatus("Lead saved for follow-up. In the live version, the team would be notified.");
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

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1fr_380px]">
        <div className="rounded-[2rem] bg-white p-5 shadow-soft ring-1 ring-slate-200">
          <div className="border-b border-slate-200 pb-4">
            <h1 className="text-2xl font-bold text-navy">We Buy Houses Seller Intake Demo</h1>
            <p className="mt-2 text-sm text-slate-600">This is the Phase 1 working demo for answering seller questions and collecting lead details.</p>
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
            <input value={input} onChange={(event) => setInput(event.target.value)} className="flex-1 rounded-full border border-slate-300 px-5 py-3 outline-none focus:border-gold" placeholder="Ask a seller question..." />
            <button className="rounded-full bg-navy px-6 py-3 font-bold text-white" type="submit">Send</button>
          </form>
        </div>

        <aside className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
          <h2 className="text-xl font-bold text-navy">Lead Capture</h2>
          <p className="mt-2 text-sm text-slate-600">For Phase 1, this form saves the lead to Supabase when configured.</p>
          <form onSubmit={submitLead} className="mt-5 space-y-3">
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
                <input value={lead[key as keyof typeof lead]} onChange={(event) => setLead((current) => ({ ...current, [key]: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-gold" />
              </label>
            ))}
            <button disabled={!canSubmitLead} className="w-full rounded-full bg-gold px-5 py-3 font-bold text-navy disabled:cursor-not-allowed disabled:opacity-50" type="submit">Save Lead</button>
          </form>
          {leadStatus && <p className="mt-4 rounded-xl bg-slate-100 p-3 text-sm text-slate-700">{leadStatus}</p>}
        </aside>
      </section>
    </main>
  );
}
