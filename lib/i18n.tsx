"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

/**
 * CENTRAL UI DICTIONARY (i18n-ready).
 *
 * v1 ships ENGLISH ONLY: `Locale = "en"` and the single `en` dictionary below.
 * Every customer-facing string goes through `t(key)`, so nothing else in the
 * app cares which locales exist.
 *
 * PHASE 2 — add Gujarati (content task, no refactor):
 *   1. Change to `export type Locale = "en" | "gu";`
 *   2. Add a `gu: { ... }` dictionary with the same keys as `en`.
 *   3. Re-enable the EN/ગુ toggle in `components/chrome.tsx`
 *      (it calls the already-present `setLang`).
 */
export type Locale = "en";
const dict = {
  en: {
    "nav.home": "Home",
    "nav.services": "Services",
    "nav.pricing": "Pricing",
    "nav.faq": "FAQ",
    "nav.track": "Track Order",
    "nav.start": "Start Agreement",

    "hero.badge": "Made for Gujarat · Gujarat Stamp Act compliant",
    "hero.title": "Legal documents online, made for Gujarat",
    "hero.subtitle":
      "Create a valid rent agreement in minutes — drafted in English, with correct Gujarat stamp duty calculated automatically. No queues, no middlemen.",
    "hero.cta1": "Create Rent Agreement",
    "hero.cta2": "See pricing",
    "hero.stat1n": "20+",
    "hero.stat1l": "clauses in every agreement",
    "hero.stat2n": "0.5%",
    "hero.stat2l": "Gujarat leave & licence duty (Art. 30A)",
    "hero.stat3n": "5 min",
    "hero.stat3l": "average time to build your agreement",

    "trust.title": "Built on valid legal rails",
    "trust.1t": "Gujarat Stamp Act, 1958",
    "trust.1d": "Stamp duty computed per Article 30A for leave & licence agreements.",
    "trust.2t": "E-stamp ready",
    "trust.2d": "Structured for SHCIL e-stamping; adapter included for real issuance.",
    "trust.3t": "Gujarati-ready architecture",
    "trust.3d": "English-first today; Gujarati templates structured for Phase 2.",
    "trust.4t": "Transparent pricing",
    "trust.4d": "Service fee + stamp duty shown separately before you pay.",

    "services.title": "Services",
    "services.subtitle": "Start with rent agreements — more Gujarat services on the way.",
    "services.rent.t": "Rent Agreement",
    "services.rent.d":
      "Guided builder for leave & licence / rent agreements. 20-clause deed in English, Gujarat stamp duty auto-calculated, PDF download.",
    "services.rent.cta": "Start now",
    "services.aff.t": "Affidavits",
    "services.aff.d": "Name, address, income, domicile and 40+ affidavit formats with correct stamp paper.",
    "services.estamp.t": "E-Stamp Paper",
    "services.estamp.d": "Buy genuine e-stamp paper for any article of the Gujarat Stamp Act.",
    "services.notice.t": "Legal Notices",
    "services.notice.d": "Advocate-reviewed legal notices for rent, consumer and cheque-bounce matters.",
    "services.soon": "Coming soon",

    "how.title": "How it works",
    "how.1t": "Answer simple questions",
    "how.1d": "Owner, tenant, property and rent details — guided step by step.",
    "how.2t": "We calculate stamp duty",
    "how.2d": "Article 30A (0.5% of total rent + deposit) applied automatically.",
    "how.3t": "Pay securely",
    "how.3d": "Razorpay checkout with a full price breakup before you pay.",
    "how.4t": "Get your document",
    "how.4d": "Download the PDF instantly; e-stamped copy follows after verification.",

    "pricing.title": "Simple, transparent pricing",
    "pricing.subtitle": "One-time fees. No subscriptions.",
    "pricing.rent.t": "Rent Agreement",
    "pricing.rent.f1": "Guided builder (English)",
    "pricing.rent.f2": "20-clause legal deed",
    "pricing.rent.f3": "Gujarat stamp-duty calculation",
    "pricing.rent.f4": "Instant PDF download",
    "pricing.rent.note": "+ stamp duty as applicable · e-sign & notary add-ons at checkout",
    "pricing.rent.cta": "Create agreement",
    "pricing.aff.t": "Affidavit",
    "pricing.aff.note": "Launching soon",
    "pricing.notice.t": "Legal Notice",
    "pricing.notice.note": "Launching soon",

    "faq.title": "Frequently asked questions",
    "faq.q1": "Is an online rent agreement legally valid in Gujarat?",
    "faq.a1":
      "Yes — if it is properly stamped as per the Gujarat Stamp Act, 1958 and signed by both parties with two witnesses. For leave & licence agreements, Article 30A prescribes duty at 0.5% of the total rent plus deposit, irrespective of the term.",
    "faq.q2": "Do I need to register the agreement?",
    "faq.a2":
      "Agreements up to 11 months do not require compulsory registration, but registration is recommended for stronger legal protection. Agreements longer than 11 months should be registered at the sub-registrar's office (registration fee approx. ₹1,100).",
    "faq.q3": "How is stamp duty calculated?",
    "faq.a3":
      "For a leave & licence agreement: 0.5% × (monthly rent × number of months + refundable security deposit). Example: ₹15,000/month × 11 months + ₹50,000 deposit = ₹2,15,000 → duty ₹1,075.",
    "faq.q4": "Can I get the agreement in Gujarati?",
    "faq.a4":
      "Not yet — v1 generates the agreement in English. A Gujarati version is planned for Phase 2; the platform is already structured for it.",
    "faq.q5": "What is e-stamping?",
    "faq.a5":
      "E-stamping is the electronic payment of stamp duty through SHCIL (Stock Holding Corporation of India Ltd.), the authorised agency for Gujarat. Our platform is structured for e-stamp issuance; until live integration, stamped copies are arranged manually and attached to your order.",
    "faq.q6": "Are you a law firm? Is this legal advice?",
    "faq.a6":
      "No. We are a document-preparation platform, not a law firm, and nothing here is legal advice. For disputes or complex matters, please consult an advocate.",

    "footer.tag": "Online legal documentation for Gujarat.",
    "footer.disclaimer":
      "We are not a law firm and do not provide legal advice. Documents are prepared from information you provide.",
    "footer.terms": "Terms of Service",
    "footer.privacy": "Privacy Policy",
    "footer.rights": "All rights reserved.",

    "wizard.title": "Rent Agreement Builder",
    "wizard.step": "Step",
    "wizard.of": "of",
    "wizard.back": "Back",
    "wizard.next": "Continue",
    "wizard.review": "Review & price",
    "wizard.s1": "Owner",
    "wizard.s2": "Tenant",
    "wizard.s3": "Property",
    "wizard.s4": "Terms",
    "wizard.s5": "Review",
    "wizard.ownerName": "Owner full name",
    "wizard.ownerFather": "Father's name (optional)",
    "wizard.ownerAddress": "Owner permanent address",
    "wizard.ownerAadhaar": "Aadhaar number (optional)",
    "wizard.tenantName": "Tenant full name",
    "wizard.tenantFather": "Father's name (optional)",
    "wizard.tenantAddress": "Tenant permanent address",
    "wizard.tenantAadhaar": "Aadhaar number (optional)",
    "wizard.propertyAddress": "Rented property address (full)",
    "wizard.propertyUse": "Property use",
    "wizard.useRes": "Residential",
    "wizard.useCom": "Commercial",
    "wizard.monthlyRent": "Monthly rent (₹)",
    "wizard.deposit": "Refundable security deposit (₹)",
    "wizard.duration": "Duration (months)",
    "wizard.startDate": "Tenancy start date",
    "wizard.notice": "Notice period (months)",
    "wizard.escalation": "Yearly rent escalation (%)",
    "wizard.maintenance": "Maintenance paid by",
    "wizard.maintOwner": "Owner",
    "wizard.maintTenant": "Tenant",
    "wizard.pets": "Pets allowed",
    "wizard.special": "Special clauses (optional, free text)",
    "wizard.specialPh": "e.g. No subletting without written consent…",
    "wizard.addons": "Add-ons",
    "wizard.addonEsign": "Aadhaar e-Sign for both parties",
    "wizard.addonNotary": "Notary attestation",
    "wizard.contact": "Your contact details",
    "wizard.yourName": "Your name",
    "wizard.phone": "Mobile number",
    "wizard.email": "Email (optional)",
    "wizard.preview": "Live preview",
    "wizard.priceTitle": "Price breakup",
    "wizard.serviceFee": "Service fee",
    "wizard.stampDuty": "Stamp duty (Art. 30A · 0.5%)",
    "wizard.addonsRow": "Add-ons",
    "wizard.total": "Total payable",
    "wizard.regNote":
      "Note: agreements longer than 11 months should be registered at the sub-registrar's office (registration fee approx. ₹1,100).",
    "wizard.dutyFormula": "0.5% × (₹{rent} × {months} months + ₹{deposit})",
    "wizard.proceed": "Proceed to payment",
    "wizard.required": "Please fill the required fields.",
    "wizard.invalidPhone": "Enter a valid 10-digit mobile number.",

    "checkout.title": "Checkout",
    "checkout.summary": "Order summary",
    "checkout.pay": "Pay securely",
    "checkout.secure": "Secured by Razorpay",
    "checkout.devTitle": "Development mode",
    "checkout.devNote":
      "Razorpay keys are not configured. In production this button opens Razorpay checkout. For local testing you can simulate a successful payment.",
    "checkout.simulate": "Simulate successful payment (dev only)",
    "checkout.processing": "Processing…",
    "checkout.failed": "Payment failed. Please try again.",

    "track.title": "Track your order",
    "track.enter": "Enter your order ID",
    "track.button": "Track",
    "track.notfound": "Order not found. Check the ID and try again.",
    "track.status": "Status",
    "track.note": "Latest update",
    "track.download": "Download agreement PDF",
    "track.stamped": "Download e-stamped copy",
    "status.draft": "Draft",
    "status.paid": "Paid",
    "status.in_review": "In review",
    "status.stamped": "Stamped",
    "status.delivered": "Delivered",
    "status.cancelled": "Cancelled",
  },

} as const;

export type DictKey = keyof (typeof dict)["en"];

const LangContext = createContext<{
  lang: Locale;
  setLang: (l: Locale) => void;
  t: (key: DictKey, vars?: Record<string, string | number>) => string;
}>({
  lang: "en",
  setLang: () => {},
  t: (k) => k,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Locale>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem("glp-lang");
    if (saved === "en") setLangState(saved);
  }, []);

  const setLang = (l: Locale) => {
    setLangState(l);
    window.localStorage.setItem("glp-lang", l);
    document.documentElement.lang = "en"; // Phase 2: derive from locale
  };

  const t = (key: DictKey, vars?: Record<string, string | number>) => {
    let s: string = (dict[lang] as Record<string, string>)[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        s = s.replace(`{${k}}`, String(v));
      }
    }
    return s;
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
