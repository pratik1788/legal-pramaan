"use client";

import { type AgreementData, getAgreementTemplate } from "@/lib/agreement";
import { formatDate } from "@/lib/format";

/** Condensed live preview of the agreement as the user types. English-only in v1. */
export function AgreementPreview({ data }: { data: AgreementData }) {
  const tpl = getAgreementTemplate("en");
  const clauses = tpl.buildClauses(data);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm leading-relaxed text-slate-800 shadow-sm">
      <p className="text-center text-base font-bold">{tpl.title}</p>
      <p className="mt-1 text-center text-xs text-slate-500">{tpl.actLine}</p>
      <p className="mt-4 font-semibold">{tpl.partiesHead}</p>
      <p className="mt-1 text-xs">
        <strong>{tpl.ownerShort}:</strong> {data.ownerName || "—"}
        <br />
        <strong>{tpl.tenantShort}:</strong> {data.tenantName || "—"}
      </p>
      <p className="mt-3 font-semibold">{tpl.propertyHead}</p>
      <p className="mt-1 text-xs">{data.propertyAddress || "—"}</p>
      <p className="mt-3 font-semibold">{tpl.keyTermsHead}:</p>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-xs">
        <li>
          {tpl.rentLabel}: ₹{(data.monthlyRent || 0).toLocaleString("en-IN")} {tpl.perMonth}
        </li>
        <li>
          {tpl.depositLabel}: ₹{(data.deposit || 0).toLocaleString("en-IN")}
        </li>
        <li>
          {tpl.termLabel}: {data.durationMonths} {tpl.monthsUnit}
          {data.startDate ? ` (${tpl.fromWord} ${formatDate(data.startDate)})` : ""}
        </li>
      </ul>
      <p className="mt-3 font-semibold">{tpl.clausesHead}</p>
      <ol className="mt-1 list-decimal space-y-1 pl-5 text-xs text-slate-600">
        {clauses.slice(0, 6).map((c, i) => (
          <li key={i}>
            <strong>{c.title}:</strong> {c.body.slice(0, 110)}…
          </li>
        ))}
      </ol>
      <p className="mt-2 text-xs italic text-slate-400">+ {tpl.moreClauses(clauses.length - 6)}…</p>
    </div>
  );
}
