# Contributing to Legal Pramaan

## Workflow

1. **Branch** off `main` for every change: `git checkout -b feat/<short-name>` or `fix/<short-name>`.
2. **Open a Pull Request** against `main`. `main` is protected — direct pushes are blocked; every change needs one approving review.
3. **Merge** via squash once approved. Render auto-deploys `main` (check the Render dashboard if a deploy doesn't start).

## Local setup

```bash
npm install
cp .env.example .env   # then fill in DATABASE_URL (postgres) and Razorpay test keys
npx prisma db push
npm run dev
```

## Conventions

- All customer-facing strings go through the `t()` dictionary in `lib/i18n.tsx` (English v1; Gujarati is Phase 2).
- Run `npm run build` before opening a PR — it must pass.
- Never commit secrets (`.env`, API keys). Razorpay **production** keys are only ever set in the Render dashboard, never in code.
- Product name is **Legal Pramaan**. Don't reintroduce Gujarat-specific branding; Gujarat is the launch market, not the product name.

## Where things live

- `app/` — pages & API routes (Next.js 14 App Router)
- `components/` — UI (header/footer in `components/chrome.tsx`)
- `lib/` — stamp-duty engine (`stampDuty.ts`), e-stamp adapter (`estamp.ts`), i18n dictionary
- `prisma/schema.prisma` — database schema (`npx prisma db push` to apply)
