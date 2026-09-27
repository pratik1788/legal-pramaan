"use client";

import { useLang } from "@/lib/i18n";
import { formatINR } from "@/lib/format";
import { REGISTRATION_INFO } from "@/lib/stampDuty";
import type { PriceBreakup } from "@/lib/pricing";

export function PricePanel({
  breakup,
  dutyBreakdown,
  durationMonths,
}: {
  breakup: PriceBreakup;
  dutyBreakdown: string;
  durationMonths: number;
}) {
  const { t } = useLang();
  return (
    <div className="card !p-5">
      <p className="font-semibold text-slate-900">{t("wizard.priceTitle")}</p>
      <div className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-600">{t("wizard.serviceFee")}</span>
          <span className="font-medium">{formatINR(breakup.serviceFeePaise)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">{t("wizard.stampDuty")}</span>
          <span className="font-medium">{formatINR(breakup.stampDutyPaise)}</span>
        </div>
        <p className="text-xs text-slate-400">{dutyBreakdown}</p>
        {breakup.addonsPaise > 0 && (
          <div className="flex justify-between">
            <span className="text-slate-600">{t("wizard.addonsRow")}</span>
            <span className="font-medium">{formatINR(breakup.addonsPaise)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold">
          <span>{t("wizard.total")}</span>
          <span className="text-brand-600">{formatINR(breakup.totalPaise)}</span>
        </div>
      </div>
      {durationMonths > REGISTRATION_INFO.thresholdMonths && (
        <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
          ⚠️ {t("wizard.regNote")}
        </p>
      )}
    </div>
  );
}
