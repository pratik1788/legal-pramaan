import { DUTY_RULES, type DutyRule } from "./stampDutyRates";

export interface DutyInput {
  /** Article of Schedule I, e.g. "30A" */
  article: string;
  /** Monthly rent in rupees (for leave & licence) */
  monthlyRentRs?: number;
  /** Term in months */
  durationMonths?: number;
  /** Refundable security deposit in rupees */
  depositRs?: number;
}

export interface DutyResult {
  rule: DutyRule;
  /** Duty in paise (rounded to nearest rupee) */
  dutyPaise: number;
  /**
   * Human-readable breakdown, keyed by locale.
   * v1: English only. Phase 2: add a `gu` entry (extend the key union).
   */
  breakdown: Record<"en", string>;
}

/**
 * Compute Gujarat stamp duty for an instrument.
 * All money math is done in paise (integers); duty is rounded to the rupee.
 */
export function computeStampDuty(input: DutyInput): DutyResult {
  const rule = DUTY_RULES.find((r) => r.article === input.article);
  if (!rule) throw new Error(`No duty rule configured for article ${input.article}`);

  let dutyPaise = 0;
  let breakdownEn = "";

  if (rule.basis === "leave_licence_rent_plus_deposit") {
    const rent = Math.max(0, input.monthlyRentRs ?? 0);
    const months = Math.max(0, input.durationMonths ?? 0);
    const deposit = Math.max(0, input.depositRs ?? 0);
    const baseRs = rent * months + deposit;
    const dutyRs = Math.round(baseRs * rule.rate);
    dutyPaise = dutyRs * 100;
    breakdownEn = `0.5% × (₹${rent.toLocaleString("en-IN")} × ${months} months + ₹${deposit.toLocaleString("en-IN")}) = ₹${dutyRs.toLocaleString("en-IN")}`;
  } else if (rule.basis === "fixed") {
    // Fixed-duty instruments handled by the caller via AFFIDAVIT_DUTY_PAISA.
    breakdownEn = `Fixed duty per ${rule.instrument.toLowerCase()}.`;
  }

  return { rule, dutyPaise, breakdown: { en: breakdownEn } };
}

/** Registration guidance for rent agreements (shown in UI, not charged). */
export const REGISTRATION_INFO = {
  thresholdMonths: 11,
  approxFeeRs: 1100,
  // UI copy lives in the i18n dictionary (wizard.regNote); Phase 2 adds Gujarati there.
};
