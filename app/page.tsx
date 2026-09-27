"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { formatINR } from "@/lib/format";
import { PRICING } from "@/lib/pricing";

export default function HomePage() {
  const { t } = useLang();

  const services = [
    {
      live: true,
      title: t("services.rent.t"),
      desc: t("services.rent.d"),
      cta: t("services.rent.cta"),
      href: "/rent-agreement",
    },
    { live: false, title: t("services.aff.t"), desc: t("services.aff.d") },
    { live: false, title: t("services.estamp.t"), desc: t("services.estamp.d") },
    { live: false, title: t("services.notice.t"), desc: t("services.notice.d") },
  ];

  const faqs = [1, 2, 3, 4, 5, 6].map((n) => ({
    q: t(`faq.q${n}` as never),
    a: t(`faq.a${n}` as never),
  }));

  return (
    <div>
      {/* HERO */}
      <section className="bg-gradient-to-b from-brand-50 to-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center md:py-24">
          <span className="inline-block rounded-full bg-brand-100 px-4 py-1.5 text-xs font-semibold text-brand-700">
            {t("hero.badge")}
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-tight text-slate-900 md:text-5xl">
            {t("hero.title")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">{t("hero.subtitle")}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/rent-agreement" className="btn-primary px-8 py-3 text-base">
              {t("hero.cta1")}
            </Link>
            <Link href="#pricing" className="btn-secondary px-8 py-3 text-base">
              {t("hero.cta2")}
            </Link>
          </div>
          <div className="mx-auto mt-12 grid max-w-3xl grid-cols-3 gap-4">
            {[
              [t("hero.stat1n"), t("hero.stat1l")],
              [t("hero.stat2n"), t("hero.stat2l")],
              [t("hero.stat3n"), t("hero.stat3l")],
            ].map(([n, l], i) => (
              <div key={i} className="card !p-4">
                <p className="text-2xl font-extrabold text-brand-600">{n}</p>
                <p className="mt-1 text-xs text-slate-600">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-center text-2xl font-bold">{t("trust.title")}</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="card">
              <p className="font-semibold text-slate-900">{t(`trust.${n}t` as never)}</p>
              <p className="mt-2 text-sm text-slate-600">{t(`trust.${n}d` as never)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold">{t("services.title")}</h2>
          <p className="mt-2 text-center text-slate-600">{t("services.subtitle")}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s, i) => (
              <div key={i} className="card flex flex-col">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-semibold text-slate-900">{s.title}</p>
                  {!s.live && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                      {t("services.soon")}
                    </span>
                  )}
                </div>
                <p className="flex-1 text-sm text-slate-600">{s.desc}</p>
                {s.live && (
                  <Link href={s.href!} className="btn-primary mt-4 w-full">
                    {s.cta}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-center text-2xl font-bold">{t("how.title")}</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="card relative">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                {n}
              </span>
              <p className="mt-3 font-semibold text-slate-900">{t(`how.${n}t` as never)}</p>
              <p className="mt-1 text-sm text-slate-600">{t(`how.${n}d` as never)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold">{t("pricing.title")}</h2>
          <p className="mt-2 text-center text-slate-600">{t("pricing.subtitle")}</p>
          <div className="mx-auto mt-8 grid max-w-4xl gap-4 md:grid-cols-3">
            <div className="card border-2 border-brand-500">
              <p className="font-semibold text-slate-900">{t("pricing.rent.t")}</p>
              <p className="mt-2 text-3xl font-extrabold text-brand-600">
                {formatINR(PRICING.rentAgreementServiceFeePaise())}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                {[1, 2, 3, 4].map((n) => (
                  <li key={n}>✓ {t(`pricing.rent.f${n}` as never)}</li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-slate-500">{t("pricing.rent.note")}</p>
              <Link href="/rent-agreement" className="btn-primary mt-4 w-full">
                {t("pricing.rent.cta")}
              </Link>
            </div>
            {[
              [t("pricing.aff.t"), t("pricing.aff.note")],
              [t("pricing.notice.t"), t("pricing.notice.note")],
            ].map(([title, note], i) => (
              <div key={i} className="card opacity-70">
                <p className="font-semibold text-slate-900">{title}</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-400">—</p>
                <p className="mt-4 text-sm text-slate-500">{note}</p>
                <span className="mt-4 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                  {t("services.soon")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-4 py-14">
        <h2 className="text-center text-2xl font-bold">{t("faq.title")}</h2>
        <div className="mt-8 space-y-3">
          {faqs.map((f, i) => (
            <details key={i} className="card !p-5">
              <summary className="cursor-pointer font-semibold text-slate-900">{f.q}</summary>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
