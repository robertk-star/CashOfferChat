# CashOfferChat Admin Sites Repair

This package restores the missing `/admin/sites` page and site-save API route.

## What this fixes

- `/admin/sites` was returning 404 because the current GitHub files do not include:
  - `src/app/admin/sites/page.tsx`
  - `src/app/api/admin/sites/route.ts`

## Files included

```text
src/app/admin/sites/page.tsx
src/app/api/admin/sites/route.ts
README.md
```

## SQL migration

No new SQL migration is required if you already ran the onboarding schema stabilization migration.

The page expects these existing tables:

```text
businesses
widget_sites
```

## Vercel environment variables

No new Vercel environment variables are required.
