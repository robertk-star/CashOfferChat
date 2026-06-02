"use client";

import { useMemo, useState } from "react";

type FAQRow = {
  trigger_question: string;
  answer: string;
};

function cleanRow(row: FAQRow): FAQRow {
  return {
    trigger_question: row.trigger_question || "",
    answer: row.answer || "",
  };
}

function emptyRow(): FAQRow {
  return { trigger_question: "", answer: "" };
}

export function ManagedFAQEditor({ initialRows }: { initialRows: FAQRow[] }) {
  const [rows, setRows] = useState<FAQRow[]>(() => initialRows.map(cleanRow).filter((row) => row.trigger_question && row.answer));
  const [draft, setDraft] = useState<FAQRow>(emptyRow());
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const visibleRows = useMemo(() => rows.filter((row) => row.trigger_question && row.answer), [rows]);

  function updateRow(index: number, field: keyof FAQRow, value: string) {
    setRows((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)));
  }

  function removeRow(index: number) {
    setRows((current) => current.filter((_, rowIndex) => rowIndex !== index));
    setEditingIndex((current) => {
      if (current === null) return null;
      if (current === index) return null;
      if (current > index) return current - 1;
      return current;
    });
  }

  function addDraft() {
    const next = cleanRow(draft);
    if (!next.trigger_question.trim() || !next.answer.trim()) return;
    setRows((current) => [...current, next]);
    setDraft(emptyRow());
    setEditingIndex(rows.length);
  }

  return (
    <div className="mt-5 space-y-6">
      <input type="hidden" name="use_managed_faqs" value="1" />
      {visibleRows.map((row, index) => (
        <input key={`trigger-${index}`} type="hidden" name="qa_trigger" value={row.trigger_question} />
      ))}
      {visibleRows.map((row, index) => (
        <input key={`answer-${index}`} type="hidden" name="qa_answer" value={row.answer} />
      ))}

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <h3 className="text-lg font-bold text-navy">Add a new FAQ</h3>
        <p className="mt-1 text-sm text-slate-600">Add one question and answer here. After you click Add FAQ, it moves into the managed FAQ list below.</p>
        <label className="mt-4 block text-sm font-semibold text-slate-700">
          What question should I look for?
          <input
            value={draft.trigger_question}
            onChange={(event) => setDraft((current) => ({ ...current, trigger_question: event.target.value }))}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal outline-none focus:border-gold"
            placeholder="Do you buy houses with tenants?"
          />
        </label>
        <label className="mt-3 block text-sm font-semibold text-slate-700">
          What is your answer to that question?
          <textarea
            value={draft.answer}
            onChange={(event) => setDraft((current) => ({ ...current, answer: event.target.value }))}
            className="mt-1 min-h-24 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal outline-none focus:border-gold"
            placeholder="Yes. We can review tenant-occupied properties..."
          />
        </label>
        <button
          className="mt-4 rounded-full bg-navy px-5 py-3 text-sm font-bold text-white shadow-soft disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          onClick={addDraft}
          disabled={!draft.trigger_question.trim() || !draft.answer.trim()}
        >
          Add FAQ to Knowledge Base
        </button>
      </div>

      <div className="space-y-4">
        {rows.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
            No FAQs are currently active. Add one above and save business settings.
          </div>
        )}
        {rows.map((row, index) => {
          const isEditing = editingIndex === index;
          return (
            <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">FAQ #{index + 1}</p>
                  {!isEditing && <h3 className="mt-1 text-base font-bold text-navy">{row.trigger_question || "Untitled FAQ"}</h3>}
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-bold text-slate-600 hover:border-gold hover:text-navy"
                    type="button"
                    onClick={() => setEditingIndex(isEditing ? null : index)}
                  >
                    {isEditing ? "Done" : "Edit"}
                  </button>
                  <button
                    className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-bold text-slate-600 hover:border-red-200 hover:text-red-700"
                    type="button"
                    onClick={() => removeRow(index)}
                  >
                    Remove
                  </button>
                </div>
              </div>

              {isEditing ? (
                <div className="mt-4 space-y-3">
                  <label className="block text-sm font-semibold text-slate-700">
                    What question should I look for?
                    <input
                      value={row.trigger_question}
                      onChange={(event) => updateRow(index, "trigger_question", event.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal outline-none focus:border-gold"
                    />
                  </label>
                  <label className="block text-sm font-semibold text-slate-700">
                    What is your answer to that question?
                    <textarea
                      value={row.answer}
                      onChange={(event) => updateRow(index, "answer", event.target.value)}
                      className="mt-1 min-h-24 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal outline-none focus:border-gold"
                    />
                  </label>
                </div>
              ) : (
                <p className="mt-3 text-sm leading-6 text-slate-700">{row.answer}</p>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs leading-5 text-slate-500">
        Click Save Business Settings after adding, editing, or removing FAQs. The widget uses this managed FAQ list before business settings or generic fallback answers.
      </p>
    </div>
  );
}
