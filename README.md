# CashOfferChat Phase 3N Hotfix — Production-Safe Route Checks

This hotfix fixes false errors on `/admin/system`.

## Problem

The previous system health checker used source-file checks like:

```text
existsSync("src/app/page.tsx")
```

That can work locally, but in Vercel production the deployed app does not expose source files in the same way. This caused every route to show as missing even when the pages worked.

## What changed

- Route checks are now production-safe.
- In production, page/API route checks show as warnings/manual checks instead of false errors.
- Local filesystem checks are still used in local development.
- Table checks and environment variable checks still run normally.
- `/admin/system` now explains the difference between real errors and manual route checks.

## Files changed

```text
src/lib/systemHealth.ts
src/app/admin/system/page.tsx
README.md
```

No SQL migration is required. No new Vercel environment variables are required.
