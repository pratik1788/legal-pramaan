# Legal Pramaan — online legal documentation for India (production build)

Online rent-agreement pipeline for Gujarat: **wizard → exact stamp-duty quote (Article 30A, Gujarat Stamp Act 1958) → Razorpay payment → PDF agreement (English; Gujarati planned for Phase 2) → order tracking → admin fulfilment dashboard.**

Stack: **Next.js 14 (App Router) + TypeScript + Tailwind**, **Prisma** (PostgreSQL default, SQLite for local dev), **@react-pdf/renderer** PDF generation, **Razorpay** checkout, **Docker** multi-stage build + Compose.

---

## 1. Quick start (local dev)

```bash
cd legal-pramaan
cp .env.example .env
# .env already points at SQLite (file:./dev.db). Set a strong ADMIN_PASSWORD and ADMIN_SESSION_SECRET.
npm install
npx prisma generate
npm run dev        # http://localhost:3000
```

Use the **SQLite schema** for local dev:
```bash
npx prisma generate --schema=prisma/schema.sqlite.prisma
npx prisma db push --schema=prisma/schema.sqlite.prisma
```
Then point `DATABASE_URL="file:./dev.db"` (default in `.env.example`).

> Razorpay keys unset → checkout shows a **dev-mode simulated payment** (`/api/checkout/simulate`). No real money moves. The simulate route is hard-blocked in production (`NODE_ENV=production` → 403).

## 2. Production deploy (Docker Compose, recommended)

```bash
cp .env.example .env
# REQUIRED in .env: ADMIN_PASSWORD, ADMIN_SESSION_SECRET
# RECOMMENDED: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, NEXT_PUBLIC_RAZORPAY_KEY_ID,
#              NEXT_PUBLIC_APP_URL=https://yourdomain.com

docker compose up -d --build
docker compose logs -f app
```

The entrypoint runs `prisma db push` against `DATABASE_URL` on first boot, then starts Next.js (standalone output) on port 3000. Uploaded stamped PDFs live in the `uploads` volume (`./uploads`).

**Behind a reverse proxy** (nginx/Caddy): terminate TLS there and forward to `localhost:3000`. Set `NEXT_PUBLIC_APP_URL` to your public origin.

### Environment variables

| Var | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | Postgres connection string |
| `ADMIN_PASSWORD` | yes | Admin dashboard password (bcrypt-hashed in memory; store a strong value) |
| `ADMIN_SESSION_SECRET` | yes | HMAC secret for admin session cookies |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | for live payments | Server-side Razorpay auth |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | for live payments | Public key embedded in checkout page |
| `NEXT_PUBLIC_APP_URL` | recommended | Public origin (links, redirects) |
| `SERVICE_FEE_RENT_AGREEMENT_PAISA` | no (default 19900) | Service fee in paise (₹199) |
| `ADDON_ESIGN_PAISA` | no (default 3900) | E-sign add-on (₹39) |
| `ADDON_NOTARY_PAISA` | no (default 7000) | Notary add-on (₹70) |

Prices are **recomputed server-side** in `POST /api/orders` — the client quote is never trusted.

## 3. What works end-to-end today

1. **Homepage** (`/`) — hero, pricing cards, how-it-works, FAQ (English).
2. **Rent-agreement wizard** (`/rent-agreement`) — 5 steps (owner → tenant → property → terms → contact), live Article 30A stamp-duty quote in English, add-ons, creates a draft order.
3. **Checkout** (`/checkout/[id]`) — Razorpay checkout.js when keys are configured; simulated payment in dev otherwise.
4. **Payment verification** (`/api/razorpay/verify`) — HMAC signature check, marks order `paid`, triggers e-stamp/e-sign adapters.
5. **PDF** (`/api/pdf/[id]`) — generated 20-clause agreement in English (react-pdf, Helvetica). Gujarati template + font registration are structured for Phase 2.
6. **Tracking** (`/track`) — public status page by order id.
7. **Admin** (`/admin`) — password login, dashboard (`/admin/dashboard`) with revenue + filters, order detail (`/admin/orders/[id]`) with status transitions, notes, stamped-PDF upload, PDF download.

## 4. Integrations you must complete before launch

### 4.1 E-stamp (required for legal validity)
`lib/estamp.ts` is a **stub**. Production path: become a **Stock Holding Corporation of India (SHCIL) authorized distributor** (SHCIL is the Central Record Keeping Agency for Gujarat) and integrate their e-stamping API. The order flow already calls `issueEstamp()` after payment; swap the stub body for the real API call, persist the returned certificate id, and overlay it on the PDF.

### 4.2 E-sign (optional add-on)
`lib/esign.ts` is a **stub**. Integrate a CCA-licensed provider (e.g. Leegality, NSDL e-Governance, Zoop). Swap the stub for real API calls and webhooks.

### 4.3 Advocate review (optional)
No code needed — route "Advocate review" add-on orders to your panel manually via the admin dashboard.

## 5. Pre-launch hardening checklist

- [ ] Add **phone-OTP verification** to `/track` and `/api/pdf/[id]` (currently order id is the only key).
- [ ] Move uploaded stamped PDFs to **S3-compatible object storage** if running multiple app replicas.
- [ ] Add **rate limiting** on `/api/orders` and auth endpoints.
- [ ] Register a **Razorpay webhook** to reconcile payments independently of the browser callback.
- [ ] Have a practising advocate review `lib/agreement.ts` clause templates before first paid order.
- [ ] Register the business (company/LLP), draft the final Terms/Privacy with counsel, set up GST invoicing.
- [ ] Set `ADMIN_PASSWORD` / `ADMIN_SESSION_SECRET` to strong random values; never commit `.env`.

## 6. Project layout

```
app/                    Next.js App Router pages
  api/orders            create (server-priced) / get / patch (admin)
  api/razorpay/*        order creation + signature verification
  api/pdf/[id]          agreement PDF download
  api/admin/*           session, order list, stamped-PDF upload
  admin/                password login, dashboard, order detail
  rent-agreement/       3-step wizard
  checkout/[id]/        Razorpay / simulated payment
  track/                public order tracking
components/             chrome.tsx (header/footer/lang toggle), wizard/*
lib/
  stampDuty.ts          Article 30A engine (Gujarat Stamp Act 1958)
  stampDutyRates.ts     rate table — single source of truth for duties
  pricing.ts            service fee + add-on pricing (env-configurable)
  agreement.ts          20-clause EN + GU templates
  pdf.tsx               react-pdf document (template-driven; Phase 2 adds Gujarati font)
  i18n.tsx              central UI string dictionary (English; Phase 2 adds `gu`)
  agreement.ts          agreement template abstraction (EN template; Phase 2 adds GU)
  estamp.ts / esign.ts  integration stubs with swap-in docs
  db.ts / adminAuth.ts / razorpay.ts / format.ts
prisma/                 schema.prisma (postgres), schema.sqlite.prisma (dev)
```

## 7. Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Production build (also validates TypeScript) |
| `npm start` | Serve production build |
| `npm run db:push` | Push Prisma schema (dev) |
| `npm run db:push:sqlite` | Push SQLite schema (dev) |

## 8. Phase 2 — Gujarati language support (planned)

v1 is English-only **by scope decision**, but the codebase is i18n-ready: adding
Gujarati is a **content task, not a refactor**. No component logic, API shape, or
database schema needs to change.

Checklist:

1. **`lib/i18n.tsx`** — change `export type Locale = "en";` to
   `"en" | "gu"` and add a `gu: { ... }` dictionary with the same keys as `en`.
   (The previous bilingual dictionary was removed in the v1 scope cut; re-add
   keys 1:1.)
2. **`lib/agreement.ts`** — change `export type DocLocale = "en";` to
   `"en" | "gu"` and add a `GU_TEMPLATE: AgreementTemplate` entry to
   `AGREEMENT_TEMPLATES` (Gujarati title, section labels, and the ~20 clause
   bodies). The wizard preview and PDF renderer consume the template
   interface, so they pick it up automatically.
3. **`lib/pdf.tsx`** — register the already-bundled Noto Sans Gujarati font
   (`public/fonts/NotoSansGujarati.ttf`, OFL licensed) via `Font.register` and
   add `fontFamily: "NotoSansGujarati"` to the styles, as noted in the file's
   Phase-2 comment.
4. **`lib/stampDuty.ts`** — extend `DutyResult["breakdown"]` from
   `Record<"en", string>` to `Record<"en" | "gu", string>` and add the Gujarati
   breakdown line.
5. **`components/chrome.tsx`** — re-add the EN/ગુ header toggle calling the
   existing `setLang` from `useLang()` (see the file's Phase-2 note). The
   `.font-guj` utility class is still defined in `app/globals.css`.
6. **Wizard** — re-add a document-language step storing the choice, and pass
   the locale into `getAgreementTemplate(locale)` / the PDF `locale` prop
   (both already parameterized).
7. **Terms/Privacy** — move the static English copy into `terms.*` /
   `privacy.*` dictionary keys with Gujarati translations.
