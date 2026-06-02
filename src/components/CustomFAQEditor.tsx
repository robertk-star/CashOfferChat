"use client";

import { useState } from "react";

type FAQRow = {
  trigger_question: string;
  answer: string;
};

function emptyRow(): FAQRow {
  return { trigger_question: "", answer: "" };
}

export function CustomFAQEditor({ initialRows }: { initialRows: FAQRow[] }) {
  const [rows, setRows] = useState<FAQRow[]>(() => {
    const startingRows = initialRows.length ? initialRows : [emptyRow(), emptyRow(), emptyRow()];
    return startingRows.map((row) => ({
      trigger_question: row.trigger_question || "",
      answer: row.answer || "",
    }));
  });

  function updateRow(index: number, field: keyof FAQRow, value: string) {
    setRows((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)));
  }

  function addRow() {
    setRows((current) => [...current, emptyRow()]);
  }

  function removeRow(index: number) {
    setRows((current) => {
      const nextRows = current.filter((_, rowIndex) => rowIndex !== index);
      return nextRows.length ? nextRows : [emptyRow()];
    });
  }

  return (
    <div className="mt-5 space-y-5">
      {rows.map((row, index) => (
        <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-navy">FAQ #{index + 1}</p>
            <button
              className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-bold text-slate-600 hover:border-red-200 hover:text-red-700"
              type="button"
              onClick={() => removeRow(index)}
            >
              Remove
            </button>
          </div>
          <label className="block text-sm font-semibold text-slate-700">
            What question should I look for?
            <input
              name="qa_trigger"
              value={row.trigger_question}
              onChange={(event) => updateRow(index, "trigger_question", event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal outline-none focus:border-gold"
              placeholder="Do you buy houses with tenants?"
            />
          </label>
          <label className="mt-3 block text-sm font-semibold text-slate-700">
            What is your answer to that question?
            <textarea
              name="qa_answer"
              value={row.answer}
              onChange={(event) => updateRow(index, "answer", event.target.value)}
              className="mt-1 min-h-24 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal outline-none focus:border-gold"
              placeholder="Yes. We can review tenant-occupied properties..."
            />
          </label>
        </div>
      ))}

      <button
        className="rounded-full bg-navy px-5 py-3 text-sm font-bold text-white shadow-soft"
        type="button"
        onClick={addRow}
      >
        Add Another FAQ
      </button>

      <p className="text-xs leading-5 text-slate-500">
        Save Business Settings after adding or editing FAQs. The widget will use these answers before the default FAQ knowledge base.
      </p>
    </div>
  );
}
