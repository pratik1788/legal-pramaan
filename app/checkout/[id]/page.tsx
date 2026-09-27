"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/i18n";
import { formatINR } from "@/lib/format";

declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => { open: () => void };
  }
}

interface OrderView {
  id: string;
  status: string;
  serviceFeePaise: number;
  stampDutyPaise: number;
  addonsPaise: number;
  totalPaise: number;
}

export default function CheckoutPage({ params }: { params: { id: string } }) {
  const { t } = useLang();
  const router = useRouter();
  const [order, setOrder] = useState<OrderView | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [rzpReady, setRzpReady] = useState(false);

  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";

  useEffect(() => {
    fetch(`/api/orders/${params.id}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.order) setOrder(j.order);
        else setError("not_found");
      })
      .catch(() => setError("not_found"));
  }, [params.id]);

  useEffect(() => {
    if (!keyId) return;
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => setRzpReady(true);
    document.body.appendChild(s);
    return () => {
      document.body.removeChild(s);
    };
  }, [keyId]);

  async function payWithRazorpay() {
    if (!order || !window.Razorpay) return;
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? "gateway_error");

      const rzp = new window.Razorpay({
        key: keyId,
        amount: j.amount,
        currency: "INR",
        name: "GujaratLegal",
        description: "Rent agreement — Gujarat",
        order_id: j.razorpayOrderId,
        handler: async (resp: { razorpay_payment_id: string; razorpay_signature: string }) => {
          const v = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: order.id,
              razorpayPaymentId: resp.razorpay_payment_id,
              razorpaySignature: resp.razorpay_signature,
            }),
          });
          if (v.ok) router.push(`/track?id=${order.id}`);
          else setError(t("checkout.failed"));
          setBusy(false);
        },
        modal: { ondismiss: () => setBusy(false) },
        theme: { color: "#155fc4" },
      });
      rzp.open();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("checkout.failed"));
      setBusy(false);
    }
  }

  async function simulate() {
    if (!order) return;
    setBusy(true);
    const r = await fetch("/api/checkout/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id }),
    });
    if (r.ok) router.push(`/track?id=${order.id}`);
    else {
      setError(t("checkout.failed"));
      setBusy(false);
    }
  }

  if (error === "not_found") {
    return <p className="mx-auto max-w-xl px-4 py-16 text-center">{t("track.notfound")}</p>;
  }
  if (!order) {
    return <p className="mx-auto max-w-xl px-4 py-16 text-center">{t("checkout.processing")}</p>;
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-2xl font-bold">{t("checkout.title")}</h1>
      <div className="card mt-6">
        <p className="font-semibold">{t("checkout.summary")}</p>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">{t("wizard.serviceFee")}</span>
            <span>{formatINR(order.serviceFeePaise)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">{t("wizard.stampDuty")}</span>
            <span>{formatINR(order.stampDutyPaise)}</span>
          </div>
          {order.addonsPaise > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-600">{t("wizard.addonsRow")}</span>
              <span>{formatINR(order.addonsPaise)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold">
            <span>{t("wizard.total")}</span>
            <span className="text-brand-600">{formatINR(order.totalPaise)}</span>
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Order ID: <code>{order.id}</code>
        </p>
      </div>

      {error && error !== "not_found" && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      {keyId ? (
        <button className="btn-primary mt-6 w-full py-3 text-base" disabled={busy || !rzpReady} onClick={payWithRazorpay}>
          {busy ? t("checkout.processing") : `${t("checkout.pay")} · ${formatINR(order.totalPaise)}`}
        </button>
      ) : (
        <div className="card mt-6 border-dashed">
          <p className="font-semibold text-amber-800">⚠️ {t("checkout.devTitle")}</p>
          <p className="mt-1 text-sm text-slate-600">{t("checkout.devNote")}</p>
          <button className="btn-secondary mt-4 w-full" disabled={busy} onClick={simulate}>
            {busy ? t("checkout.processing") : t("checkout.simulate")}
          </button>
        </div>
      )}
      <p className="mt-3 text-center text-xs text-slate-400">🔒 {t("checkout.secure")}</p>
    </div>
  );
}
