"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatINR } from "@/lib/format";

const NEXT: Record<string, string[]> = {
  draft: ["cancelled"],
  paid: ["in_review", "cancelled"],
  in_review: ["stamped", "cancelled"],
  stamped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

interface FullOrder {
  id: string;
  status: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  payload: {
    data: Record<string, unknown>;
    addons: { esign: boolean; notary: boolean };
    dutyBreakdown: Record<string, string>;
  };
  serviceFeePaise: number;
  stampDutyPaise: number;
  addonsPaise: number;
  totalPaise: number;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  stampedPdfPath?: string | null;
  trackingNote?: string | null;
  adminNote?: string | null;
  createdAt: string;
}

export default function AdminOrderDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<FullOrder | null>(null);
  const [trackingNote, setTrackingNote] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [msg, setMsg] = useState("");
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    const r = await fetch(`/api/orders/${params.id}`);
    if (r.status === 401) {
      router.replace("/admin");
      return;
    }
    const j = await r.json();
    if (j.order) {
      setOrder(j.order);
      setTrackingNote(j.order.trackingNote ?? "");
      setAdminNote(j.order.adminNote ?? "");
    }
  }, [params.id, router]);

  useEffect(() => {
    load();
  }, [load]);

  async function transition(status: string) {
    setMsg("");
    const r = await fetch(`/api/orders/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (r.ok) {
      setMsg(`Status → ${status}`);
      load();
    } else {
      const j = await r.json();
      setMsg(`Failed: ${j.error}`);
    }
  }

  async function saveNotes() {
    setMsg("");
    const r = await fetch(`/api/orders/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackingNote, adminNote }),
    });
    setMsg(r.ok ? "Notes saved." : "Failed to save.");
  }

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMsg("");
    const form = new FormData();
    form.append("orderId", params.id);
    form.append("file", file);
    const r = await fetch("/api/admin/upload", { method: "POST", body: form });
    const j = await r.json();
    setMsg(r.ok ? `Stamped PDF attached: ${j.path}` : `Upload failed: ${j.error}`);
    setUploading(false);
    load();
  }

  if (!order) return <p className="mx-auto max-w-4xl px-4 py-16">Loading…</p>;
  const d = order.payload.data;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <button className="text-sm text-brand-600 hover:underline" onClick={() => router.push("/admin/dashboard")}>
        ← Back to orders
      </button>
      <div className="mt-2 flex items-center justify-between">
        <h1 className="font-mono text-lg font-bold">{order.id}</h1>
        <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
          {order.status}
        </span>
      </div>
      {msg && <p className="mt-3 rounded-lg bg-slate-100 p-3 text-sm">{msg}</p>}

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="card">
          <p className="font-semibold">Customer</p>
          <p className="mt-2 text-sm">{order.customerName}</p>
          <p className="text-sm text-slate-600">{order.customerPhone}</p>
          <p className="text-sm text-slate-600">{order.customerEmail ?? "—"}</p>
          <p className="mt-3 font-semibold">Money</p>
          <p className="text-sm">Service: {formatINR(order.serviceFeePaise)}</p>
          <p className="text-sm">Stamp duty: {formatINR(order.stampDutyPaise)}</p>
          <p className="text-sm">Add-ons: {formatINR(order.addonsPaise)}</p>
          <p className="text-sm font-bold">Total: {formatINR(order.totalPaise)}</p>
          <p className="mt-3 font-semibold">Payment</p>
          <p className="font-mono text-xs text-slate-600">rzp order: {order.razorpayOrderId ?? "—"}</p>
          <p className="font-mono text-xs text-slate-600">rzp payment: {order.razorpayPaymentId ?? "—"}</p>
        </div>
        <div className="card">
          <p className="font-semibold">Agreement data</p>
          <dl className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between gap-2"><dt className="text-slate-500">Owner</dt><dd className="text-right">{String(d.ownerName ?? "")}</dd></div>
            <div className="flex justify-between gap-2"><dt className="text-slate-500">Tenant</dt><dd className="text-right">{String(d.tenantName ?? "")}</dd></div>
            <div className="flex justify-between gap-2"><dt className="text-slate-500">Rent</dt><dd>₹{Number(d.monthlyRent ?? 0).toLocaleString("en-IN")}/mo</dd></div>
            <div className="flex justify-between gap-2"><dt className="text-slate-500">Deposit</dt><dd>₹{Number(d.deposit ?? 0).toLocaleString("en-IN")}</dd></div>
            <div className="flex justify-between gap-2"><dt className="text-slate-500">Term</dt><dd>{String(d.durationMonths ?? "")} months from {String(d.startDate ?? "")}</dd></div>
            <div className="flex justify-between gap-2"><dt className="text-slate-500">Language</dt><dd>English (v1)</dd></div>
            <div className="flex justify-between gap-2"><dt className="text-slate-500">Add-ons</dt><dd>{[order.payload.addons.esign && "e-sign", order.payload.addons.notary && "notary"].filter(Boolean).join(", ") || "—"}</dd></div>
          </dl>
          <p className="mt-2 text-xs text-slate-500">{order.payload.dutyBreakdown?.en}</p>
          <a href={`/api/pdf/${order.id}`} className="btn-secondary mt-3 text-sm">
            Download generated PDF
          </a>
        </div>
      </div>

      <div className="card mt-4">
        <p className="font-semibold">Fulfilment</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {(NEXT[order.status] ?? []).map((s) => (
            <button key={s} className="btn-secondary text-sm" onClick={() => transition(s)}>
              → {s}
            </button>
          ))}
          {(NEXT[order.status] ?? []).length === 0 && (
            <p className="text-sm text-slate-500">No further transitions.</p>
          )}
        </div>
        <div className="mt-4">
          <label className="label">Attach stamped PDF (manual e-stamp fulfilment)</label>
          <input type="file" accept="application/pdf" onChange={upload} disabled={uploading} className="text-sm" />
          {order.stampedPdfPath && (
            <p className="mt-1 text-sm">
              Attached:{" "}
              <a href={`/api/admin/upload?orderId=${order.id}`} className="text-brand-600 hover:underline">
                {order.stampedPdfPath}
              </a>
            </p>
          )}
        </div>
        <div className="mt-4 grid gap-3">
          <div>
            <label className="label">Customer-facing tracking note</label>
            <input className="input" value={trackingNote} onChange={(e) => setTrackingNote(e.target.value)} placeholder="Visible on the track page" />
          </div>
          <div>
            <label className="label">Internal admin note</label>
            <textarea className="input" rows={3} value={adminNote} onChange={(e) => setAdminNote(e.target.value)} />
          </div>
          <button className="btn-primary w-fit" onClick={saveNotes}>
            Save notes
          </button>
        </div>
      </div>
    </div>
  );
}
