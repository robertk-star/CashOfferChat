"use client";

import { FormEvent, useMemo, useState } from "react";

type Message = { role: "user" | "assistant"; content: string; action?: "open_intake" };

type LeadForm = {
  name: string;
  phone: string;
  email: string;
  propertyAddress: string;
  propertyCity: string;
  timeline: string;
  situation: string;
  propertyCondition: string;
  notes: string;
};

const emptyLeadForm: LeadForm = {
  name: "",
  phone: "",
  email: "",
  propertyAddress: "",
  propertyCity: "",
  timeline: "",
  situation: "",
  propertyCondition: "",
  notes: "",
};

const starters = [
  "Do you buy as-is?",
  "How fast can I close?",
  "Do you buy houses with tenants?",
  "Are there any fees?",
  "Can you take a look at it?",
];

const requiredFields: Array<keyof LeadForm> = ["propertyCity", "propertyAddress", "situation", "timeline", "propertyCondition", "name", "phone"];

export function DemoChat() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I can answer questions about selling a house as-is for cash. When you are ready, I can open a short intake form so the team can review the property details. There is no obligation.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showIntake, setShowIntake] = useState(false);
  const [leadForm, setLeadForm] = useState<LeadForm>(emptyLeadForm);
  const [leadStatus, setLeadStatus] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [leadId, setLeadId] = useState<string | null>(null);

  const completionCount = useMemo(() => requiredFields.filter((key) => Boolean(leadForm[key].trim())).length, [leadForm]);
  const canSaveLead = useMemo(() => {
    return Boolean(leadForm.name.trim() && leadForm.phone.trim() && (leadForm.propertyAddress.trim() || leadForm.propertyCity.trim()));
  }, [leadForm]);

  function validateLeadForm() {
    const errors: string[] = [];
    if (!leadForm.name.trim()) errors.push("Name is required.");
    if (!leadForm.phone.trim()) errors.push("Phone number is required so the team can follow up quickly.");
    if (!leadForm.propertyAddress.trim() && !leadForm.propertyCity.trim()) errors.push("Property city or property address is required.");
    return errors;
  }

  async function sendMessage(content: string) {
    const trimmed = content.trim();
    if (!trimmed || isLoading) return;

    setMessages((current) => [...current, { role: "user", content: trimmed }]);
    setInput("");
    setIsLoading(true);
    setLeadStatus(null);
    setValidationErrors([]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, message: trimmed, sourceUrl: window.location.href }),
      });
      const data = await response.json();
      if (data.conversationId) setConversationId(data.conversationId);
      if (data.showIntake) setShowIntake(true);

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.reply || "I can answer questions, or open the short intake form when you are ready.",
          action: data.showIntake ? "open_intake" : undefined,
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "I can answer questions, or open the short intake form when you are ready.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  async function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors = validateLeadForm();
    setValidationErrors(errors);
    if (errors.length > 0) {
      setLeadStatus(null);
      return;
    }
    setLeadStatus("Saving lead...");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...leadForm, conversationId, sourceUrl: window.location.href }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Lead save failed");

      setLeadId(data.id);
      setLeadStatus("Lead saved for follow-up.");
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "Thanks. The details have been saved for follow-up. In a live setup, the home-buying team would review the property information and contact the seller.",
        },
      ]);
    } catch (error) {
      setLeadStatus(error instanceof Error ? error.message : "Lead could not be saved. Check Supabase environment variables and confirm the SQL migration has been run.");
    }
  }

  function updateField(key: keyof LeadForm, value: string) {
    setLeadForm((current) => ({ ...current, [key]: value }));
    setValidationErrors([]);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a className="font-bold text-xl text-navy" href="/">CashOfferChat</a>
          <a className="rounded-full bg-gold px-5 py-2 text-sm font-bold text-navy" href="tel:9725550100">Demo Call CTA</a>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1fr_430px]">
        <div className="rounded-[2rem] bg-white p-5 shadow-soft ring-1 ring-slate-200">
          <div className="border-b border-slate-200 pb-4">
            <h1 className="text-2xl font-bold text-navy">We Buy Houses Seller Chat Demo</h1>
            <p className="mt-2 text-sm text-slate-600">
              Phase 2A-R separates AI Q&amp;A from lead capture. The chat answers questions; the structured intake form saves reliable lead data.
            </p>
          </div>

          <div className="h-[520px] space-y-4 overflow-y-auto py-6">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={message.role === "user" ? "chat-bubble-user" : "chat-bubble-assistant"}>
                <p>{message.content}</p>
                {message.action === "open_intake" && (
                  <button onClick={() => setShowIntake(true)} className="mt-3 rounded-full bg-gold px-4 py-2 text-sm font-bold text-navy">
                    Open Short Intake Form
                  </button>
                )}
              </div>
            ))}
            {isLoading && <div className="chat-bubble-assistant">Typing...</div>}
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {starters.map((starter) => (
              <button key={starter} onClick={() => sendMessage(starter)} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                {starter}
              </button>
            ))}
            <button onClick={() => setShowIntake(true)} className="rounded-full border border-gold bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">
              Open intake form
            </button>
          </div>

          <form onSubmit={(event) => { event.preventDefault(); sendMessage(input); }} className="flex gap-3">
            <input value={input} onChange={(event) => setInput(event.target.value)} className="flex-1 rounded-full border border-slate-300 px-5 py-3 outline-none focus:border-gold" placeholder="Ask a question about selling..." />
            <button className="rounded-full bg-navy px-6 py-3 font-bold text-white" type="submit">Send</button>
          </form>
        </div>

        <aside className="space-y-5">
          <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-navy">Structured Intake</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Reliable lead details are captured here instead of being guessed from free-form chat messages.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{completionCount}/7</span>
            </div>

            {!showIntake ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
                <p>The intake form opens when the seller asks for a property review, requests an offer, or clicks the button.</p>
                <button onClick={() => setShowIntake(true)} className="mt-4 rounded-full bg-gold px-5 py-3 font-bold text-navy">
                  Open Intake Form
                </button>
              </div>
            ) : (
              <form onSubmit={submitLead} className="mt-5 space-y-4">
                <label className="block text-sm font-semibold text-slate-700">
                  Property city <span className="text-red-600">*</span>
                  <input value={leadForm.propertyCity} onChange={(event) => updateField("propertyCity", event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-gold" placeholder="Plano" />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Property address <span className="text-red-600">*</span>
                  <input value={leadForm.propertyAddress} onChange={(event) => updateField("propertyAddress", event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-gold" placeholder="Street address" />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Situation
                  <select value={leadForm.situation} onChange={(event) => updateField("situation", event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-gold">
                    <option value="">Select one</option>
                    <option>Just want to sell fast</option>
                    <option>Needs repairs</option>
                    <option>Inherited property</option>
                    <option>Tenant occupied</option>
                    <option>Vacant property</option>
                    <option>Behind on payments</option>
                    <option>Relocating</option>
                    <option>Other</option>
                  </select>
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Timeline
                  <select value={leadForm.timeline} onChange={(event) => updateField("timeline", event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-gold">
                    <option value="">Select one</option>
                    <option>ASAP</option>
                    <option>Within 30 days</option>
                    <option>1–3 months</option>
                    <option>Just exploring</option>
                  </select>
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Property condition
                  <textarea value={leadForm.propertyCondition} onChange={(event) => updateField("propertyCondition", event.target.value)} className="mt-1 min-h-20 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-gold" placeholder="Move-in ready, outdated, roof issues, major repairs, etc." />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Name <span className="text-red-600">*</span>
                    <input required value={leadForm.name} onChange={(event) => updateField("name", event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-gold" placeholder="Seller name" />
                  </label>
                  <label className="block text-sm font-semibold text-slate-700">
                    Phone number <span className="text-red-600">*</span>
                    <input required type="tel" value={leadForm.phone} onChange={(event) => updateField("phone", event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-gold" placeholder="Best number to call or text" />
                  </label>
                </div>
                <label className="block text-sm font-semibold text-slate-700">
                  Email <span className="font-normal text-slate-400">optional</span>
                  <input value={leadForm.email} onChange={(event) => updateField("email", event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-gold" />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Notes <span className="font-normal text-slate-400">optional</span>
                  <textarea value={leadForm.notes} onChange={(event) => updateField("notes", event.target.value)} className="mt-1 min-h-20 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-gold" placeholder="Anything else the team should know?" />
                </label>
                <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                  Required fields: name, phone number, and either property city or property address. This form is for follow-up only. Requesting a review does not create an obligation to sell.
                </p>
                {validationErrors.length > 0 && (
                  <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                    <p className="font-bold">Please fix the following:</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      {validationErrors.map((error) => <li key={error}>{error}</li>)}
                    </ul>
                  </div>
                )}
                <button disabled={!canSaveLead} className="w-full rounded-full bg-gold px-5 py-3 font-bold text-navy disabled:cursor-not-allowed disabled:opacity-50" type="submit">
                  Save Lead for Follow-Up
                </button>
              </form>
            )}

            {leadStatus && <p className="mt-4 rounded-xl bg-green/10 p-3 text-sm font-semibold text-navy">{leadStatus}</p>}
            {leadId && <p className="mt-2 text-xs text-slate-500">Lead ID: {leadId}</p>}
          </div>

          <div className="rounded-[2rem] bg-white p-6 text-sm text-slate-600 shadow-soft ring-1 ring-slate-200">
            <h2 className="text-lg font-bold text-navy">Why this is more reliable</h2>
            <p className="mt-2">The AI no longer tries to guess form fields from ambiguous chat messages. It answers questions and opens a controlled intake form when the seller is ready.</p>
          </div>
        </aside>
      </section>
    </main>
  );
}
