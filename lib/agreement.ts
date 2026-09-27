import { formatDate } from "./format";

export type PropertyUse = "residential" | "commercial";

/** All data collected by the rent-agreement wizard. */
export interface AgreementData {
  ownerName: string;
  ownerFather?: string;
  ownerAddress: string;
  ownerAadhaar?: string;
  tenantName: string;
  tenantFather?: string;
  tenantAddress: string;
  tenantAadhaar?: string;
  propertyAddress: string;
  propertyUse: PropertyUse;
  monthlyRent: number;
  deposit: number;
  durationMonths: number;
  startDate: string; // YYYY-MM-DD
  noticeMonths: number;
  escalationPct: number;
  maintenanceBy: "owner" | "tenant";
  petsAllowed: boolean;
  specialClauses?: string;
}

export interface Clause {
  title: string;
  body: string;
}

function endDateOf(start: string, months: number): string {
  const d = new Date(start + "T00:00:00");
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/** Build the ~20 standard clauses in English. */
export function buildClausesEn(d: AgreementData): Clause[] {
  const end = endDateOf(d.startDate, d.durationMonths);
  const use = d.propertyUse === "residential" ? "residential" : "commercial";
  const maint = d.maintenanceBy === "owner" ? "the Owner" : "the Tenant";
  return [
    {
      title: "Grant of licence",
      body: `The Owner hereby grants to the Tenant a licence to occupy and use the premises described in the Schedule below ("the Premises") for ${use} purposes, on the terms and conditions set out in this Agreement.`,
    },
    {
      title: "Term",
      body: `This Agreement shall commence on ${formatDate(d.startDate)} and shall remain in force for a period of ${d.durationMonths} month(s), ending on ${formatDate(end)}, unless terminated earlier in accordance with this Agreement.`,
    },
    {
      title: "Rent",
      body: `The Tenant shall pay a monthly rent of ${inr(d.monthlyRent)} (Rupees ${inr(d.monthlyRent)} only) to the Owner, payable on or before the 5th day of each calendar month, by bank transfer or other traceable mode of payment.`,
    },
    {
      title: "Security deposit",
      body: `The Tenant has paid / shall pay a refundable security deposit of ${inr(d.deposit)} to the Owner. The deposit shall be refunded to the Tenant within 30 days of the Tenant vacating the Premises, after adjusting any lawful dues such as unpaid rent or damage beyond normal wear and tear.`,
    },
    {
      title: "Rent escalation",
      body:
        d.escalationPct > 0
          ? `The monthly rent shall increase by ${d.escalationPct}% upon each yearly anniversary of the commencement date, if the Agreement is renewed or extended.`
          : `No automatic yearly escalation of rent is agreed between the parties; any increase shall be by mutual written consent.`,
    },
    {
      title: "Use of premises",
      body: `The Premises shall be used solely for ${use} purposes. The Tenant shall not use the Premises for any unlawful or immoral purpose, nor cause nuisance or annoyance to neighbours.`,
    },
    {
      title: "Utilities",
      body: `Electricity, water, gas, internet and other utility charges for the Premises during the term shall be borne by the Tenant, unless otherwise agreed in writing.`,
    },
    {
      title: "Maintenance and repairs",
      body: `Routine maintenance of the Premises shall be carried out by ${maint}. Structural repairs shall remain the responsibility of the Owner. The Tenant shall keep the Premises in good and clean condition.`,
    },
    {
      title: "Alterations",
      body: `The Tenant shall not make any structural alterations or additions to the Premises without the prior written consent of the Owner.`,
    },
    {
      title: "Inspection",
      body: `The Owner may inspect the Premises after giving the Tenant at least 24 hours' prior notice, at reasonable hours.`,
    },
    {
      title: "Subletting and assignment",
      body: `The Tenant shall not sublet, assign or part with possession of the Premises, in whole or in part, without the prior written consent of the Owner.`,
    },
    {
      title: "Pets",
      body: d.petsAllowed
        ? `The Tenant is permitted to keep pets at the Premises, provided they do not cause nuisance or damage.`
        : `The Tenant shall not keep any pets at the Premises without the prior written consent of the Owner.`,
    },
    {
      title: "Notice period",
      body: `Either party may terminate this Agreement by giving ${d.noticeMonths} month(s) prior written notice to the other party.`,
    },
    {
      title: "Termination",
      body: `The Owner may terminate this Agreement with immediate effect if the Tenant fails to pay rent for two consecutive months or commits a material breach of any term and fails to remedy it within 15 days of written notice.`,
    },
    {
      title: "Renewal",
      body: `The parties may renew this Agreement for a further term by mutual written consent, on terms to be agreed, before the expiry of the current term.`,
    },
    {
      title: "Handover on expiry",
      body: `On expiry or earlier termination, the Tenant shall vacate the Premises and hand over vacant and peaceful possession to the Owner in substantially the same condition as at commencement, fair wear and tear excepted.`,
    },
    {
      title: "Taxes",
      body: `Property tax and other statutory levies on the Premises shall be borne by the Owner. Any tax or charge arising from the Tenant's occupation shall be borne by the Tenant.`,
    },
    {
      title: "Compliance with law",
      body: `The Tenant shall comply with all applicable laws, rules and regulations, including society / association bye-laws, while occupying the Premises.`,
    },
    {
      title: "Police verification",
      body: `The Tenant shall cooperate with tenant police verification as required by local authorities, and provide identity documents on request.`,
    },
    {
      title: "Governing law and jurisdiction",
      body: `This Agreement shall be governed by the laws of India. Subject to applicable law, courts at the place where the Premises is situated shall have jurisdiction. Stamp duty has been paid in accordance with the Gujarat Stamp Act, 1958.`,
    },
    {
      title: "Entire agreement",
      body: `This Agreement constitutes the entire understanding between the parties regarding the Premises and supersedes all prior discussions. Any amendment must be in writing and signed by both parties.`,
    },
  ];
}

// ---------------------------------------------------------------------------
// TEMPLATE ABSTRACTION LAYER (i18n-ready)
//
// v1 ships ENGLISH ONLY: `DocLocale = "en"` and the single `EN_TEMPLATE` below.
// The wizard preview and the PDF renderer consume ONLY this interface — they
// never branch on language themselves.
//
// PHASE 2 — add Gujarati (content task, no refactor):
//   1. Change to `export type DocLocale = "en" | "gu";`
//   2. Add a `gu: GU_TEMPLATE` entry to AGREEMENT_TEMPLATES with the same shape
//      (Gujarati title, labels and clause bodies).
//   3. Thread the locale through from the caller: `getAgreementTemplate("gu")`,
//      `buildClauses(data, "gu")`, and the PDF `locale` prop (already exists).
// ---------------------------------------------------------------------------

/** v1: English only. Phase 2: "en" | "gu". */
export type DocLocale = "en";

export interface AgreementTemplate {
  locale: DocLocale;
  title: string;
  subtitle: (orderId?: string) => string;
  actLine: string;
  partiesHead: string;
  ownerLabel: string;
  tenantLabel: string;
  ownerShort: string;
  tenantShort: string;
  scheduleHead: string;
  propertyHead: string;
  keyTermsHead: string;
  clausesHead: string;
  specialHead: string;
  rentLabel: string;
  perMonth: string;
  depositLabel: string;
  termLabel: string;
  monthsUnit: string;
  fromWord: string;
  moreClauses: (remaining: number) => string;
  useLine: (use: PropertyUse) => string;
  clauseHead: (index: number, title: string) => string;
  partyLine: (label: string, name: string, father: string | undefined, addr: string) => string;
  ownerSign: string;
  tenantSign: string;
  witness: (n: number) => string;
  nameDate: string;
  nameSign: string;
  footer: (startDate: string) => string;
  buildClauses: (d: AgreementData) => Clause[];
}

const EN_TEMPLATE: AgreementTemplate = {
  locale: "en",
  title: "LEAVE & LICENCE / RENT AGREEMENT",
  subtitle: (orderId) => `Under the Gujarat Stamp Act, 1958 · Order ${orderId ?? ""}`,
  actLine: "Under the Gujarat Stamp Act, 1958",
  partiesHead: "PARTIES",
  ownerLabel: "OWNER (First Party)",
  tenantLabel: "TENANT (Second Party)",
  ownerShort: "Owner",
  tenantShort: "Tenant",
  scheduleHead: "SCHEDULE OF PROPERTY",
  propertyHead: "PROPERTY",
  keyTermsHead: "KEY TERMS",
  clausesHead: "CLAUSES",
  specialHead: "Special conditions",
  rentLabel: "Rent",
  perMonth: "/ month",
  depositLabel: "Deposit",
  termLabel: "Term",
  monthsUnit: "months",
  fromWord: "from",
  moreClauses: (n) => `${n} more clauses`,
  useLine: (use) => `Use: ${use === "residential" ? "Residential" : "Commercial"}`,
  clauseHead: (i, title) => `Clause ${i + 1}: ${title}`,
  partyLine: (label, name, father, addr) =>
    `${label}: ${name}${father ? `, son/daughter of ${father}` : ""}, residing at ${addr}`,
  ownerSign: "Signature of Owner",
  tenantSign: "Signature of Tenant",
  witness: (n) => `Witness ${n}`,
  nameDate: "Name / Date",
  nameSign: "Name / Signature",
  footer: (startDate) =>
    `Prepared for tenancy commencing ${formatDate(startDate)}. This document is prepared from information you provided and is not legal advice. We are not a law firm.`,
  buildClauses: buildClausesEn,
};

/** All document locales. Phase 2 adds `gu` here. */
export const AGREEMENT_TEMPLATES: Record<DocLocale, AgreementTemplate> = {
  en: EN_TEMPLATE,
};

export function getAgreementTemplate(locale: DocLocale = "en"): AgreementTemplate {
  return AGREEMENT_TEMPLATES[locale];
}

/** Build clauses for a locale (default English). */
export function buildClauses(d: AgreementData, locale: DocLocale = "en"): Clause[] {
  return getAgreementTemplate(locale).buildClauses(d);
}

/** Document title for a locale (default English). */
export function agreementTitle(locale: DocLocale = "en"): string {
  return getAgreementTemplate(locale).title;
}
