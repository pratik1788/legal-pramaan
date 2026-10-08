"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/i18n";
import {
  type AffidavitData,
  type AffidavitType,
  AFFIDAVIT_TYPES,
  defaultDeclarations,
} from "@/lib/affidavit";
import { PRICING, buildPriceBreakup } from "@/lib/pricing";
import { Field, TextInput, TextArea, Check } from "@/components/wizard/fields";
import { AffidavitPreview } from "@/components/wizard/affidavitPreview";
import { PricePanel } from "@/components/wizard/pricePanel";

const STORAGE_KEY = "glp-affidavit-v1";

interface WizardState extends AffidavitData {
  yourName: string;
  phone: string;
  email: string;
  addonEsign: boolean;
  addonNotary: boolean;
}

const defaults: WizardState = {
  affidavitType: "general",
  affiantName: "",
  affiantFather: "",
  affiantAddress: "",
  affiantAadhaar: "",
  oldName: "",
  newName: "",
  nameChangeReason: "",
  proofAddress: "",
  residingSince: "",
  annualIncome: 0,
  incomeSource: "",
  declarations: ["That ________."],
  place: "",
  date: new Date().toISOString().slice(0, 10),
  yourName: "",
  phone: "",
  email: "",
  addonEsign: false,
  addonNotary: true, // affidavits must be sworn before a notary
};

function load(): WizardState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaults, ...JSON.parse(raw) };
  } catch {}
  return defaults;
}

export default function AffidavitWizard() {
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
  }, [s]);

  const set = <K extends keyof WizardState>(k: K, v: WizardState[K]) =>
    setS((prev) => ({ ...prev, [k]: v }));

  const num = (v: string, fallback = 0) => {
    const n = parseInt(v.replace(/[^0-9]/g, ""), 10);
    return Number.isFinite(n) ? n : fallback;
  };

  function setType(v: AffidavitType) {
    setS((prev) => {
      const next = { ...prev, affidavitType: v };
      // Pre-fill declarations for the chosen type (keep user's edits if they re-pick same type).
      if (v !== prev.affidavitType) next.declarations = defaultDeclarations(next);
      return next;
    });
  }

  const breakup = useMemo(() => {
    const addons =
      (s.addonEsign ? PRICING.esignPaise() : 0) + (s.addonNotary ? PRICING.notaryPaise() : 0);
    // v1: service fee only — stamp paper is arranged at fulfilment.
    return buildPriceBreakup(PRICING.affidavitServiceFeePaise(), 0, addons);
  }, [s.addonEsign, s.addonNotary]);

  const steps = [t("aff.s1"), t("aff.s2"), t("aff.s3"), t("aff.s4")];

  function validateStep(i: number): boolean {
    if (i === 1) {
      if (!s.affiantName.trim() || !s.affiantFather.trim() || !s.affiantAddress.trim() || !s.place.trim() || !s.date)
        return false;
      if (s.affidavitType === "name_change" && (!s.oldName?.trim() || !s.newName?.trim())) return false;
      if (s.affidavitType === "address_proof" && !s.proofAddress?.trim()) return false;
      if (s.affidavitType === "income" && !((s.annualIncome ?? 0) > 0)) return false;
    }
    if (i === 2 && s.declarations.map((d) => d.trim()).filter(Boolean).length === 0) return false;
    if (i === 3 && (!s.yourName.trim() || !/^[6-9]\d{9}$/.test(s.phone.trim()))) return false;
    return true;
  }

  function next() {
    setError("");
    if (!validateStep(step)) {
      setError(
        step === 3 && !/^[6-9]\d{9}$/.test(s.phone.trim())
          ? t("wizard.invalidPhone")
          : t("wizard.required"),
      );
      return;
    }
    if (step < 3) setStep(step + 1);
  }

  function updateDeclaration(i: number, v: string) {
    setS((prev) => {
      const declarations = [...prev.declarations];
      declarations[i] = v;
      return { ...prev, declarations };
    });
  }

  function addDeclaration() {
    setS((prev) => ({ ...prev, declarations: [...prev.declarations, "That ________."] }));
  }

  function removeDeclaration(i: number) {
    setS((prev) => ({ ...prev, declarations: prev.declarations.filter((_, j) => j !== i) }));
  }

  async function proceedToPayment() {
    setError("");
    if (!validateStep(3)) {
      setError(!/^[6-9]\d{9}$/.test(s.phone.trim()) ? t("wizard.invalidPhone") : t("wizard.required"));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType: "affidavit",
          data: {
            affidavitType: s.affidavitType,
            affiantName: s.affiantName,
            affiantFather: s.affiantFather,
            affiantAddress: s.affiantAddress,
            affiantAadhaar: s.affiantAadhaar,
            oldName: s.oldName,
            newName: s.newName,
            nameChangeReason: s.nameChangeReason,
            proofAddress: s.proofAddress,
            residingSince: s.residingSince,
            annualIncome: s.annualIncome,
            incomeSource: s.incomeSource,
            declarations: s.declarations.map((d) => d.trim()).filter(Boolean),
            place: s.place,
            date: s.date,
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
      <h1 className="text-2xl font-bold">{t("aff.title")}</h1>

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
              <p className="font-semibold text-slate-900">{t("aff.chooseType")}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {AFFIDAVIT_TYPES.map((ty) => (
                  <button
                    key={ty.value}
                    onClick={() => setType(ty.value)}
                    className={`rounded-xl border p-4 text-left transition ${
                      s.affidavitType === ty.value
                        ? "border-brand-600 bg-brand-50 ring-1 ring-brand-600"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <p className="font-semibold text-slate-900">{ty.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{ty.desc}</p>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <Field label={t("aff.fullName")}><TextInput value={s.affiantName} onChange={(e) => set("affiantName", e.target.value)} /></Field>
              <Field label={t("aff.fatherName")}><TextInput value={s.affiantFather} onChange={(e) => set("affiantFather", e.target.value)} /></Field>
              <Field label={t("aff.address")}><TextArea value={s.affiantAddress} onChange={(e) => set("affiantAddress", e.target.value)} /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label={t("aff.aadhaar")}><TextInput value={s.affiantAadhaar} onChange={(e) => set("affiantAadhaar", e.target.value)} inputMode="numeric" maxLength={12} /></Field>
                <Field label={t("aff.place")}><TextInput value={s.place} onChange={(e) => set("place", e.target.value)} /></Field>
              </div>
              <Field label={t("aff.date")}><TextInput type="date" value={s.date} onChange={(e) => set("date", e.target.value)} /></Field>

              {s.affidavitType === "name_change" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label={t("aff.oldName")}><TextInput value={s.oldName} onChange={(e) => set("oldName", e.target.value)} /></Field>
                    <Field label={t("aff.newName")}><TextInput value={s.newName} onChange={(e) => set("newName", e.target.value)} /></Field>
                  </div>
                  <Field label={t("aff.nameReason")}><TextInput value={s.nameChangeReason} onChange={(e) => set("nameChangeReason", e.target.value)} /></Field>
                </>
              )}
              {s.affidavitType === "address_proof" && (
                <>
                  <Field label={t("aff.proofAddress")}><TextArea value={s.proofAddress} onChange={(e) => set("proofAddress", e.target.value)} /></Field>
                  <Field label={t("aff.residingSince")}><TextInput value={s.residingSince} onChange={(e) => set("residingSince", e.target.value)} placeholder="Jan 2020" /></Field>
                </>
              )}
              {s.affidavitType === "income" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label={t("aff.annualIncome")}><TextInput value={String(s.annualIncome || "")} onChange={(e) => set("annualIncome", num(e.target.value))} inputMode="numeric" /></Field>
                    <Field label={t("aff.incomeSource")}><TextInput value={s.incomeSource} onChange={(e) => set("incomeSource", e.target.value)} /></Field>
                  </div>
                </>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <p className="font-semibold text-slate-900">{t("aff.declarations")}</p>
              <p className="text-xs text-slate-500">{t("aff.declarationsHelp")}</p>
              {s.declarations.map((d, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="mt-3 w-6 shrink-0 text-right text-sm font-semibold text-slate-400">{i + 1}.</span>
                  <TextArea value={d} onChange={(e) => updateDeclaration(i, e.target.value)} rows={2} />
                  <button
                    onClick={() => removeDeclaration(i)}
                    disabled={s.declarations.length <= 1}
                    className="mt-3 shrink-0 text-xs font-medium text-red-600 hover:underline disabled:opacity-30"
                  >
                    {t("aff.removePara")}
                  </button>
                </div>
              ))}
              <button onClick={addDeclaration} className="btn-secondary text-sm">
                {t("aff.addPara")}
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <div className="rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
                {t("aff.stampNote")}
              </div>
              <p className="font-semibold text-slate-900">{t("aff.contact")}</p>
              <Field label={t("wizard.yourName")}><TextInput value={s.yourName} onChange={(e) => set("yourName", e.target.value)} /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label={t("wizard.phone")}><TextInput value={s.phone} onChange={(e) => set("phone", e.target.value)} inputMode="numeric" maxLength={10} /></Field>
                <Field label={t("wizard.email")}><TextInput type="email" value={s.email} onChange={(e) => set("email", e.target.value)} /></Field>
              </div>
              <p className="font-semibold text-slate-900">{t("wizard.addons")}</p>
              <Check label={t("wizard.addonEsign")} checked={s.addonEsign} onChange={(v) => set("addonEsign", v)} />
              <Check label={t("wizard.addonNotary")} checked={s.addonNotary} onChange={(v) => set("addonNotary", v)} />
            </>
          )}

          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          <div className="flex justify-between pt-2">
            <button className="btn-secondary" disabled={step === 0} onClick={() => setStep(step - 1)}>
              {t("wizard.back")}
            </button>
            {step < 3 ? (
              <button className="btn-primary" onClick={next}>
                {t("wizard.next")}
              </button>
            ) : (
              <button className="btn-primary" disabled={submitting} onClick={proceedToPayment}>
                {submitting ? t("checkout.processing") : t("aff.proceed")}
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <PricePanel breakup={breakup} dutyBreakdown={t("aff.stampNote")} durationMonths={0} />
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700">{t("wizard.preview")}</p>
            <AffidavitPreview data={s} />
          </div>
        </div>
      </div>
    </div>
  );
}
