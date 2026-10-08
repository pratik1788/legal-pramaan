"use client";

import { type AffidavitData, buildAffidavitEn, AFFIDAVIT_TYPES } from "@/lib/affidavit";

/** Condensed live preview of the affidavit as the user types. English-only in v1. */
export function AffidavitPreview({ data }: { data: AffidavitData }) {
  const doc = buildAffidavitEn(data);
  const typeTitle = AFFIDAVIT_TYPES.find((t) => t.value === data.affidavitType)?.title ?? "";
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm leading-relaxed text-slate-800 shadow-sm">
      <p className="text-center text-base font-bold">{doc.title}</p>
      <p className="mt-1 text-center text-xs text-slate-500">{typeTitle}</p>
      <p className="mt-4 text-xs">{doc.intro || "—"}</p>
      <ol className="mt-3 list-decimal space-y-1 pl-5 text-xs text-slate-600">
        {doc.paragraphs.slice(0, 4).map((p, i) => (
          <li key={i}>{p.length > 110 ? p.slice(0, 110) + "…" : p}</li>
        ))}
        {doc.paragraphs.length === 0 && <li className="text-slate-400">No declarations yet.</li>}
      </ol>
      {doc.paragraphs.length > 4 && (
        <p className="mt-1 text-xs italic text-slate-400">+ {doc.paragraphs.length - 4} more…</p>
      )}
      <p className="mt-3 text-xs italic text-slate-500">
        {doc.verification.length > 140 ? doc.verification.slice(0, 140) + "…" : doc.verification}
      </p>
    </div>
  );
}
