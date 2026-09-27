/**
 * Pricing configuration. Amounts in paise.
 * Overridable via environment variables (see .env.example).
 */
function envInt(name: string, fallback: number): number {
  const v = process.env[name];
  if (!v) return fallback;
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export const PRICING = {
  /** Service fee for a rent-agreement order (excludes stamp duty). */
  rentAgreementServiceFeePaise: () => envInt("SERVICE_FEE_RENT_AGREEMENT_PAISA", 19900),
  /** Optional add-ons */
  esignPaise: () => envInt("ADDON_ESIGN_PAISA", 3900),
  notaryPaise: () => envInt("ADDON_NOTARY_PAISA", 7000),
};

export interface PriceBreakup {
  serviceFeePaise: number;
  stampDutyPaise: number;
  addonsPaise: number;
  totalPaise: number;
}

export function buildPriceBreakup(
  serviceFeePaise: number,
  stampDutyPaise: number,
  addonsPaise: number,
): PriceBreakup {
  return {
    serviceFeePaise,
    stampDutyPaise,
    addonsPaise,
    totalPaise: serviceFeePaise + stampDutyPaise + addonsPaise,
  };
}
