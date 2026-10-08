import { formatDate } from "./format";

export type AffidavitType = "general" | "name_change" | "address_proof" | "income";

export const AFFIDAVIT_TYPES: { value: AffidavitType; title: string; desc: string }[] = [
  {
    value: "general",
    title: "General Affidavit",
    desc: "A sworn statement for any purpose — declare facts in your own numbered paragraphs.",
  },
  {
    value: "name_change",
    title: "Name Change Affidavit",
    desc: "Declare that you have changed your name — used for gazette, PAN, Aadhaar, passport updates.",
  },
  {
    value: "address_proof",
    title: "Address Proof Affidavit",
    desc: "Swear that you reside at a given address — for KYC, admissions, government applications.",
  },
  {
    value: "income",
    title: "Income Affidavit",
    desc: "Declare your annual income — for scholarships, EWS certificates, fee concessions.",
  },
];

/** All data collected by the affidavit wizard. */
export interface AffidavitData {
  affidavitType: AffidavitType;
  affiantName: string;
  affiantFather: string;
  affiantAddress: string;
  affiantAadhaar?: string;
  // name_change
  oldName?: string;
  newName?: string;
  nameChangeReason?: string;
  // address_proof
  proofAddress?: string;
  residingSince?: string;
  // income
  annualIncome?: number;
  incomeSource?: string;
  // numbered declarations (paragraphs of the affidavit)
  declarations: string[];
  place: string;
  date: string; // YYYY-MM-DD
}

export interface AffidavitDoc {
  title: string;
  subtitle: string;
  intro: string;
  paragraphs: string[];
  verification: string;
  deponentLabel: string;
  notaryLabel: string;
  notaryBody: string;
}

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/** Default declarations per type, used to pre-fill the wizard. */
export function defaultDeclarations(d: Partial<AffidavitData>): string[] {
  switch (d.affidavitType) {
    case "name_change":
      return [
        `That my former name was ${d.oldName || "________"} and I have changed my name to ${d.newName || "________"}.`,
        `That the reason for the change of name is ${d.nameChangeReason || "________"}.`,
        `That I shall henceforth be known and addressed as ${d.newName || "________"} for all purposes, and all authorities may update their records accordingly.`,
        `That this affidavit is sworn for the purpose of publishing the change of name and updating my identity documents.`,
      ];
    case "address_proof":
      return [
        `That I am residing at ${d.proofAddress || "________"}${d.residingSince ? ` since ${d.residingSince}` : ""}.`,
        `That the above address is my permanent / current residential address and I may be served any communication there.`,
        `That this affidavit is sworn for the purpose of submitting address proof to the concerned authorities.`,
      ];
    case "income":
      return [
        `That my total annual income from all sources is ${d.annualIncome ? inr(d.annualIncome) : "________"}${d.incomeSource ? `, earned from ${d.incomeSource}` : ""}.`,
        `That the above statement of income is true to my personal knowledge and I have not concealed any source of income.`,
        `That this affidavit is sworn for the purpose of ${"________"}.`,
      ];
    default:
      return [`That ${"________"}.`];
  }
}

/** Build the full affidavit document (English) from wizard data. */
export function buildAffidavitEn(d: AffidavitData): AffidavitDoc {
  const typeTitle =
    AFFIDAVIT_TYPES.find((t) => t.value === d.affidavitType)?.title ?? "Affidavit";
  const name = d.affiantName.trim();
  const father = d.affiantFather.trim();
  const address = d.affiantAddress.trim();
  const dateStr = d.date ? formatDate(d.date) : "";
  const place = d.place.trim();

  const intro =
    `I, ${name}, son/daughter of ${father}, residing at ${address}, ` +
    `do hereby solemnly affirm and declare as under:`;

  const paragraphs = d.declarations
    .map((s) => s.trim())
    .filter(Boolean);

  const verification =
    `I, the above-named deponent, do hereby verify that the contents of this affidavit ` +
    `are true and correct to my personal knowledge, and nothing material has been concealed therefrom. ` +
    `Verified at ${place || "________"} on this ${dateStr || "________"}.`;

  return {
    title: "AFFIDAVIT",
    subtitle: `${typeTitle} — sworn before a Notary Public`,
    intro,
    paragraphs,
    verification,
    deponentLabel: "DEPONENT",
    notaryLabel: "NOTARY PUBLIC",
    notaryBody:
      `Sworn and subscribed before me by the deponent, who is personally known to me / ` +
      `identified to my satisfaction, at ${place || "________"} on ${dateStr || "________"}.`,
  };
}
