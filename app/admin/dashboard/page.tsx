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

const STATUSES = ["", "draft", "paid", "in_review", "stamped", "delivered", "cancelled"];

export default function AdminDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [revenue, setRevenue] = useState<{ _sum: { totalPaise: number | null }; _count: number } | null>(null);
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");

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
        <h1 className="text-2xl font-bold">Orders</h1>
        <button className="btn-secondary text-sm" onClick={logout}>
          Sign out
        </button>
      </div>

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
    </div>
  );
}
