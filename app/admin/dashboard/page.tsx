"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatINR } from "@/lib/format";

interface Order {
  id: string;
  status: string;
  customerName: string;
  customerPhone: string;
  totalPaise: number;
  createdAt: string;
}

interface ChangeRequest {
  id: string;
  title: string;
  description: string;
  authorName: string;
  status: "NEW" | "IN_PROGRESS" | "DONE" | "DECLINED";
  adminNote: string;
  createdAt: string;
}

const STATUSES = ["", "draft", "paid", "in_review", "stamped", "delivered", "cancelled"];
const REQUEST_STATUSES = ["NEW", "IN_PROGRESS", "DONE", "DECLINED"];

function RequestsPanel() {
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState("NEW");
  const [editing, setEditing] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editNote, setEditNote] = useState("");

  const load = useCallback(async () => {
    const r = await fetch("/api/admin/requests");
    if (!r.ok) return;
    const j = await r.json();
    setRequests(j.requests ?? []);
    const c: Record<string, number> = {};
    for (const row of j.counts ?? []) c[row.status] = row._count;
    setCounts(c);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function startEdit(rq: ChangeRequest) {
    setEditing(rq.id);
    setEditStatus(rq.status);
    setEditNote(rq.adminNote);
  }

  async function saveEdit(id: string) {
    const r = await fetch("/api/admin/requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: editStatus, adminNote: editNote }),
    });
    if (r.ok) {
      setEditing(null);
      load();
    }
  }

  const visible = filter === "ALL" ? requests : requests.filter((r) => r.status === filter);

  return (
    <div>
      <div className="mt-4 flex flex-wrap gap-2">
        {["ALL", ...REQUEST_STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              filter === s ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {s === "ALL" ? "All" : s.replace("_", " ")}
            {s !== "ALL" && counts[s] ? ` (${counts[s]})` : ""}
          </button>
        ))}
        <button className="btn-secondary ml-auto !py-1.5 text-sm" onClick={load}>
          Refresh
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {visible.map((rq) => (
          <div key={rq.id} className="card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{rq.title}</p>
                <p className="text-xs text-slate-400">
                  {rq.authorName ? `${rq.authorName} · ` : ""}
                  {new Date(rq.createdAt).toLocaleString("en-IN")}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium">
                {rq.status.replace("_", " ")}
              </span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{rq.description}</p>
            {editing === rq.id ? (
              <div className="mt-3 space-y-2 rounded bg-slate-50 p-3">
                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="input !w-auto">
                  {REQUEST_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ")}
                    </option>
                  ))}
                </select>
                <textarea
                  className="input"
                  placeholder="Note to the team (visible on the team page)"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                />
                <div className="flex gap-2">
                  <button className="btn-primary !py-1.5 text-sm" onClick={() => saveEdit(rq.id)}>
                    Save
                  </button>
                  <button className="btn-secondary !py-1.5 text-sm" onClick={() => setEditing(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-2">
                {rq.adminNote && <p className="text-sm text-slate-600">Update: {rq.adminNote}</p>}
                <button className="mt-1 text-sm font-medium text-brand-600 hover:underline" onClick={() => startEdit(rq)}>
                  Update status
                </button>
              </div>
            )}
          </div>
        ))}
        {visible.length === 0 && <p className="text-sm text-slate-500">No requests in this view.</p>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [revenue, setRevenue] = useState<{ _sum: { totalPaise: number | null }; _count: number } | null>(null);
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"orders" | "requests">("orders");

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (q.trim()) params.set("q", q.trim());
    const r = await fetch(`/api/admin/orders?${params.toString()}`);
    if (r.status === 401) {
      router.replace("/admin");
      return;
    }
    const j = await r.json();
    setOrders(j.orders ?? []);
    setRevenue(j.revenue ?? null);
  }, [status, q, router]);

  useEffect(() => {
    load();
  }, [load]);

  async function logout() {
    await fetch("/api/admin/session", { method: "DELETE" });
    router.replace("/admin");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Admin</h1>
          <div className="flex gap-1 rounded-full bg-slate-100 p-1 text-sm">
            <button
              onClick={() => setTab("orders")}
              className={`rounded-full px-3 py-1 font-medium ${tab === "orders" ? "bg-white shadow" : "text-slate-500"}`}
            >
              Orders
            </button>
            <button
              onClick={() => setTab("requests")}
              className={`rounded-full px-3 py-1 font-medium ${tab === "requests" ? "bg-white shadow" : "text-slate-500"}`}
            >
              Change requests
            </button>
          </div>
        </div>
        <button className="btn-secondary text-sm" onClick={logout}>
          Sign out
        </button>
      </div>

      {tab === "requests" ? (
        <RequestsPanel />
      ) : (
        <>
          {revenue && (
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="card !p-4">
                <p className="text-xs text-slate-500">Collected revenue</p>
                <p className="text-xl font-bold text-brand-600">{formatINR(revenue._sum.totalPaise ?? 0)}</p>
              </div>
              <div className="card !p-4">
                <p className="text-xs text-slate-500">Paid orders</p>
                <p className="text-xl font-bold">{revenue._count}</p>
              </div>
            </div>
          )}

      <div className="mt-4 flex flex-wrap gap-2">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input !w-auto">
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === "" ? "All statuses" : s}
            </option>
          ))}
        </select>
        <input
          className="input !w-64"
          placeholder="Search name / phone / id"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="btn-secondary" onClick={load}>
          Refresh
        </button>
      </div>

      <div className="card mt-4 overflow-x-auto !p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
              <th className="p-3">Order</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Status</th>
              <th className="p-3">Total</th>
              <th className="p-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-3">
                  <Link href={`/admin/orders/${o.id}`} className="font-mono text-xs text-brand-600 hover:underline">
                    {o.id.slice(0, 8)}…
                  </Link>
                </td>
                <td className="p-3">
                  {o.customerName}
                  <span className="block text-xs text-slate-500">{o.customerPhone}</span>
                </td>
                <td className="p-3">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium">{o.status}</span>
                </td>
                <td className="p-3 font-medium">{formatINR(o.totalPaise)}</td>
                <td className="p-3 text-xs text-slate-500">{new Date(o.createdAt).toLocaleString("en-IN")}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-500">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
        </>
      )}
    </div>
  );
}
