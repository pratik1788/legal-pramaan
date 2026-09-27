"use client";

import { useState } from "react";
import { useLang } from "@/lib/i18n";
import { TextInput } from "@/components/wizard/fields";

const STEPS = ["draft", "paid", "in_review", "stamped", "delivered"] as const;

export default function TrackPage() {
  const { t } = useLang();
  const [id, setId] = useState("");
  const [order, setOrder] = useState<{
    id: string;
    status: string;
    trackingNote?: string | null;
    hasStampedCopy: boolean;
  } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function track() {
    const clean = id.trim();
    if (!clean) return;
    setBusy(true);
    setError("");
    setOrder(null);
    try {
      const r = await fetch(`/api/orders/${encodeURIComponent(clean)}`);
      const j = await r.json();
      if (!r.ok || !j.order) throw new Error("nf");
      setOrder(j.order);
    } catch {
      setError(t("track.notfound"));
    } finally {
      setBusy(false);
    }
  }

  const idx = order ? STEPS.indexOf(order.status as never) : -1;

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-2xl font-bold">{t("track.title")}</h1>
      <div className="card mt-6">
        <div className="flex gap-2">
          <TextInput
            placeholder={t("track.enter")}
            value={id}
            onChange={(e) => setId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && track()}
          />
          <button className="btn-primary shrink-0" disabled={busy} onClick={track}>
            {t("track.button")}
          </button>
        </div>
      </div>

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {order && (
        <div className="card mt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              <code>{order.id}</code>
            </p>
            <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
              {t(`status.${order.status}` as never)}
            </span>
          </div>

          <div className="mt-6 flex items-center">
            {STEPS.map((s, i) => (
              <div key={s} className="flex flex-1 items-center last:flex-none">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    i <= idx ? "bg-brand-600 text-white" : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-1 flex-1 ${i < idx ? "bg-brand-600" : "bg-slate-200"}`} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-slate-500">
            {STEPS.map((s) => (
              <span key={s} className="w-12 text-center leading-tight">
                {t(`status.${s}` as never)}
              </span>
            ))}
          </div>

          {order.trackingNote && (
            <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
              <strong>{t("track.note")}:</strong> {order.trackingNote}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <a href={`/api/pdf/${order.id}`} className="btn-secondary text-sm">
              {t("track.download")}
            </a>
            {order.hasStampedCopy && (
              <span className="btn-primary pointer-events-none text-sm opacity-60">
                {t("track.stamped")}
              </span>
            )}
          </div>
          {order.hasStampedCopy && (
            <p className="mt-2 text-xs text-slate-500">
              Your stamped copy is ready — a download link will be sent by SMS/email shortly.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
