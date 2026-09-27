"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/i18n";
import type { AgreementData } from "@/lib/agreement";
import { computeStampDuty } from "@/lib/stampDuty";
import { PRICING, buildPriceBreakup } from "@/lib/pricing";
import { Field, TextInput, TextArea, Check, RadioRow } from "@/components/wizard/fields";
import { AgreementPreview } from "@/components/wizard/preview";
import { PricePanel } from "@/components/wizard/pricePanel";

const STORAGE_KEY = "glp-wizard-v1";

interface WizardState extends AgreementData {
  yourName: string;
  phone: string;
  email: string;
  addonEsign: boolean;
  addonNotary: boolean;
}

const defaults: WizardState = {
  ownerName: "",
  ownerFather: "",
  ownerAddress: "",
  ownerAadhaar: "",
  tenantName: "",
  tenantFather: "",
  tenantAddress: "",
  tenantAadhaar: "",
  propertyAddress: "",
  propertyUse: "residential",
  monthlyRent: 15000,
  deposit: 50000,
  durationMonths: 11,
  startDate: new Date().toISOString().slice(0, 10),
  noticeMonths: 1,
  escalationPct: 0,
  maintenanceBy: "tenant",
  petsAllowed: false,
  specialClauses: "",
  yourName: "",
  phone: "",
  email: "",
  addonEsign: false,
  addonNotary: false,
};

function load(): WizardState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaults, ...JSON.parse(raw) };
  } catch {}
  return defaults;
}

export default function RentAgreementWizard() {
  const { t } = useLang();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [s, setS] = useState<WizardState>(defaults);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setS(load());
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch {}
  }, [s ]);

  const set = <K extends keyof WizardState>(k: K, v: WizardState[K]) =>
    setS((prev) => ({ ...prev, [k]: v }));

  const num = (v: string, fallback = 0) => {
    const n = parseInt(v.replace(/[^0-9]/g, ""), 10);
    return Number.isFinite(n) ? n : fallback;
  };

  const duty = useMemo(
    () =>
      computeStampDuty({
        article: "30A",
        monthlyRentRs: s.monthlyRent,
        durationMonths: s.durationMonths,
        depositRs: s.deposit,
      }),
    [s.monthlyRent, s.durationMonths, s.deposit],
  );

  const breakup = useMemo(() => {
    const addons =
      (s.addonEsign ? PRICING.esignPaise() : 0) + (s.addonNotary ? PRICING.notaryPaise() : 0);
    return buildPriceBreakup(PRICING.rentAgreementServiceFeePaise(), duty.dutyPaise, addons);
  }, [duty, s.addonEsign, s.addonNotary]);

  const steps = [t("wizard.s1"), t("wizard.s2"), t("wizard.s3"), t("wizard.s4"), t("wizard.s5")];

  function validateStep(i: number): boolean {
    if (i === 0 && (!s.ownerName.trim() || !s.ownerAddress.trim())) return false;
    if (i === 1 && (!s.tenantName.trim() || !s.tenantAddress.trim())) return false;
    if (i === 2 && !s.propertyAddress.trim()) return false;
    if (
      i === 3 &&
      !(s.monthlyRent > 0 && s.deposit >= 0 && s.durationMonths >= 1 && s.durationMonths <= 60 && s.startDate)
    )
      return false;
    if (i === 4 && (!s.yourName.trim() || !/^[6-9]\d{9}$/.test(s.phone.trim()))) return false;
    return true;
  }

  function next() {
    setError("");
    if (!validateStep(step)) {
      setError(step === 4 && !/^[6-9]\d{9}$/.test(s.phone.trim()) ? t("wizard.invalidPhone") : t("wizard.required"));
      return;
    }
    if (step < 4) setStep(step + 1);
  }

  async function proceedToPayment() {
    setError("");
    if (!validateStep(4)) {
      setError(!/^[6-9]\d{9}$/.test(s.phone.trim()) ? t("wizard.invalidPhone") : t("wizard.required"));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType: "rent_agreement",
          data: {
            ownerName: s.ownerName,
            ownerFather: s.ownerFather,
            ownerAddress: s.ownerAddress,
            tenantName: s.tenantName,
            tenantFather: s.tenantFather,
            tenantAddress: s.tenantAddress,
            propertyAddress: s.propertyAddress,
            propertyUse: s.propertyUse,
            monthlyRent: s.monthlyRent,
            deposit: s.deposit,
            durationMonths: s.durationMonths,
            startDate: s.startDate,
            noticeMonths: s.noticeMonths,
            escalationPct: s.escalationPct,
            maintenanceBy: s.maintenanceBy,
            petsAllowed: s.petsAllowed,
            specialClauses: s.specialClauses,
          },
          contact: { name: s.yourName, phone: s.phone, email: s.email },
          addons: { esign: s.addonEsign, notary: s.addonNotary },
          price: breakup,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "order_failed");
      window.localStorage.removeItem(STORAGE_KEY);
      router.push(`/checkout/${json.orderId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "order_failed");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">{t("wizard.title")}</h1>

      {/* stepper */}
      <div className="mt-6 flex items-center gap-1 overflow-x-auto">
        {steps.map((label, i) => (
          <div key={i} className="flex flex-1 items-center">
            <button
              onClick={() => i < step && setStep(i)}
              className={`flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-sm font-semibold ${
                i === step
                  ? "bg-brand-600 text-white"
                  : i < step
                    ? "bg-brand-100 text-brand-700"
                    : "bg-slate-200 text-slate-500"
              }`}
            >
              {i + 1}
            </button>
            <span className={`ml-2 hidden text-xs font-medium sm:block ${i === step ? "text-slate-900" : "text-slate-500"}`}>
              {label}
            </span>
            {i < steps.length - 1 && <span className="mx-2 h-px flex-1 bg-slate-200" />}
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="card space-y-4">
          {step === 0 && (
            <>
              <Field label={t("wizard.ownerName")}><TextInput value={s.ownerName} onChange={(e) => set("ownerName", e.target.value)} /></Field>
              <Field label={t("wizard.ownerFather")}><TextInput value={s.ownerFather} onChange={(e) => set("ownerFather", e.target.value)} /></Field>
              <Field label={t("wizard.ownerAddress")}><TextArea value={s.ownerAddress} onChange={(e) => set("ownerAddress", e.target.value)} /></Field>
              <Field label={t("wizard.ownerAadhaar")}><TextInput value={s.ownerAadhaar} onChange={(e) => set("ownerAadhaar", e.target.value)} inputMode="numeric" maxLength={12} /></Field>
            </>
          )}
          {step === 1 && (
            <>
              <Field label={t("wizard.tenantName")}><TextInput value={s.tenantName} onChange={(e) => set("tenantName", e.target.value)} /></Field>
              <Field label={t("wizard.tenantFather")}><TextInput value={s.tenantFather} onChange={(e) => set("tenantFather", e.target.value)} /></Field>
              <Field label={t("wizard.tenantAddress")}><TextArea value={s.tenantAddress} onChange={(e) => set("tenantAddress", e.target.value)} /></Field>
              <Field label={t("wizard.tenantAadhaar")}><TextInput value={s.tenantAadhaar} onChange={(e) => set("tenantAadhaar", e.target.value)} inputMode="numeric" maxLength={12} /></Field>
            </>
          )}
          {step === 2 && (
            <>
              <Field label={t("wizard.propertyAddress")}><TextArea value={s.propertyAddress} onChange={(e) => set("propertyAddress", e.target.value)} rows={4} /></Field>
              <Field label={t("wizard.propertyUse")}>
                <RadioRow
                  value={s.propertyUse}
                  onChange={(v) => set("propertyUse", v as "residential" | "commercial")}
                  options={[
                    { value: "residential", label: t("wizard.useRes") },
                    { value: "commercial", label: t("wizard.useCom") },
                  ]}
                />
              </Field>
            </>
          )}
          {step === 3 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Field label={t("wizard.monthlyRent")}><TextInput value={String(s.monthlyRent)} onChange={(e) => set("monthlyRent", num(e.target.value))} inputMode="numeric" /></Field>
                <Field label={t("wizard.deposit")}><TextInput value={String(s.deposit)} onChange={(e) => set("deposit", num(e.target.value))} inputMode="numeric" /></Field>
                <Field label={t("wizard.duration")}><TextInput type="number" min={1} max={60} value={s.durationMonths} onChange={(e) => set("durationMonths", num(e.target.value, 11))} /></Field>
                <Field label={t("wizard.startDate")}><TextInput type="date" value={s.startDate} onChange={(e) => set("startDate", e.target.value)} /></Field>
                <Field label={t("wizard.notice")}><TextInput type="number" min={0} max={12} value={s.noticeMonths} onChange={(e) => set("noticeMonths", num(e.target.value, 1))} /></Field>
                <Field label={t("wizard.escalation")}><TextInput type="number" min={0} max={100} value={s.escalationPct} onChange={(e) => set("escalationPct", num(e.target.value))} /></Field>
              </div>
              <Field label={t("wizard.maintenance")}>
                <RadioRow
                  value={s.maintenanceBy}
                  onChange={(v) => set("maintenanceBy", v as "owner" | "tenant")}
                  options={[
                    { value: "owner", label: t("wizard.maintOwner") },
                    { value: "tenant", label: t("wizard.maintTenant") },
                  ]}
                />
              </Field>
              <Check label={t("wizard.pets")} checked={s.petsAllowed} onChange={(v) => set("petsAllowed", v)} />
              <Field label={t("wizard.special")}><TextArea value={s.specialClauses} placeholder={t("wizard.specialPh")} onChange={(e) => set("specialClauses", e.target.value)} /></Field>
            </>
          )}
          {step === 4 && (
            <>
              <p className="font-semibold text-slate-900">{t("wizard.contact")}</p>
              <Field label={t("wizard.yourName")}><TextInput value={s.yourName} onChange={(e) => set("yourName", e.target.value)} /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label={t("wizard.phone")}><TextInput value={s.phone} onChange={(e) => set("phone", e.target.value)} inputMode="numeric" maxLength={10} /></Field>
                <Field label={t("wizard.email")}><TextInput type="email" value={s.email} onChange={(e) => set("email", e.target.value)} /></Field>
              </div>
              <p className="font-semibold text-slate-900">{t("wizard.addons")}</p>
              <Check label={`${t("wizard.addonEsign")}`} checked={s.addonEsign} onChange={(v) => set("addonEsign", v)} />
              <Check label={`${t("wizard.addonNotary")}`} checked={s.addonNotary} onChange={(v) => set("addonNotary", v)} />
            </>
          )}

          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          <div className="flex justify-between pt-2">
            <button className="btn-secondary" disabled={step === 0} onClick={() => setStep(step - 1)}>
              {t("wizard.back")}
            </button>
            {step < 4 ? (
              <button className="btn-primary" onClick={next}>
                {t("wizard.next")}
              </button>
            ) : (
              <button className="btn-primary" disabled={submitting} onClick={proceedToPayment}>
                {submitting ? t("checkout.processing") : t("wizard.proceed")}
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <PricePanel breakup={breakup} dutyBreakdown={duty.breakdown.en} durationMonths={s.durationMonths} />
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700">{t("wizard.preview")}</p>
            <AgreementPreview data={s} />
          </div>
        </div>
      </div>
    </div>
  );
}
