/**
 * Gujarat stamp-duty rate table.
 *
 * Kept as a plain config file so new articles / instruments can be added
 * without touching the calculation engine (see lib/stampDuty.ts).
 *
 * Sources: Gujarat Stamp Act, 1958, Schedule I.
 */
export interface DutyRule {
  /** e.g. "30A" */
  article: string;
  /** Human-readable instrument name */
  instrument: string;
  /** Basis on which duty is computed */
  basis: "leave_licence_rent_plus_deposit" | "fixed" | "percent_of_consideration";
  /** Rate as a decimal fraction (0.005 = 0.5%) */
  rate: number;
  /** Legal citation shown to the user */
  citation: string;
  /** Extra guidance shown in the UI */
  noteEn: string;
  noteGu: string;
}

export const DUTY_RULES: DutyRule[] = [
  {
    article: "30A",
    instrument: "Leave & Licence / Rent Agreement",
    basis: "leave_licence_rent_plus_deposit",
    // "Fifty paise for every hundred rupees" — Gujarat Stamp Act, Schedule I,
    // Article 30A: irrespective of the period of the agreement.
    rate: 0.005,
    citation: "Gujarat Stamp Act, 1958 — Schedule I, Article 30A",
    noteEn:
      "Duty is 0.5% of (total rent over the term + refundable deposit), irrespective of the agreement's duration.",
    noteGu:
      "કરારની મુદત ગમે તેટલી હોય, (મુદતનું કુલ ભાડું + પરતપાત્ર ડિપોઝિટ) ના 0.5% ડ્યુટી થાય.",
  },
  {
    article: "4",
    instrument: "Affidavit",
    basis: "fixed",
    rate: 0,
    citation: "Gujarat Stamp Act, 1958 — Schedule I, Article 4",
    noteEn: "Fixed duty per affidavit (commonly ₹20 in Gujarat; confirm current rate).",
    noteGu: "દરેક સોગંદનામું નિશ્ચિત ડ્યુટી (સામાન્ય રીતે ગુજરાતમાં ₹20; વર્તમાન દર ખાતરી કરો).",
  },
];

/** Fixed affidavit duty in paise (₹20). Override via config when rates change. */
export const AFFIDAVIT_DUTY_PAISA = 2000;
