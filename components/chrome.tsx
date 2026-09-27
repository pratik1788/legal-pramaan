"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n";

// NOTE: v1 is English-only, so there is no language toggle in the header.
// Phase 2 (Gujarati): re-add the toggle here calling `setLang` from useLang()
// — the provider, dictionary and document templates already support it.

export function Header() {
  const { t } = useLang();
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-lg font-bold text-white">
            GL
          </span>
          <span className="font-bold text-slate-900">
            Gujarat<span className="text-brand-600">Legal</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-medium text-slate-600 md:flex">
          <Link href="/#services" className="hover:text-brand-600">{t("nav.services")}</Link>
          <Link href="/#pricing" className="hover:text-brand-600">{t("nav.pricing")}</Link>
          <Link href="/#faq" className="hover:text-brand-600">{t("nav.faq")}</Link>
          <Link href="/track" className="hover:text-brand-600">{t("nav.track")}</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/rent-agreement" className="btn-primary hidden sm:inline-flex">
            {t("nav.start")}
          </Link>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  const { t } = useLang();
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="font-bold text-slate-900">
              Gujarat<span className="text-brand-600">Legal</span>
            </p>
            <p className="mt-2 text-sm text-slate-600">{t("footer.tag")}</p>
          </div>
          <div className="text-sm">
            <Link href="/terms" className="block py-1 text-slate-600 hover:text-brand-600">{t("footer.terms")}</Link>
            <Link href="/privacy" className="block py-1 text-slate-600 hover:text-brand-600">{t("footer.privacy")}</Link>
            <Link href="/track" className="block py-1 text-slate-600 hover:text-brand-600">{t("nav.track")}</Link>
          </div>
          <div className="rounded-xl bg-amber-50 p-4 text-xs leading-relaxed text-amber-900">
            <strong>⚖️ {t("footer.disclaimer")}</strong>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} GujaratLegal · {t("footer.rights")}
        </p>
      </div>
    </footer>
  );
}
