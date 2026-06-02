# CashOfferChat Phase 3E Hotfix — Onboarding Duplicate Recovery

This hotfix improves onboarding when a business/site was partly created and the same Site ID is submitted again.

## What changed

- If the Site ID already exists, onboarding now redirects to a recovery/success state instead of a hard error.
- The page shows the embed code for the existing Site ID.
- The page includes a link to `/admin/sites`.
- The onboarding route avoids creating a duplicate business when the site already exists.
- The duplicate-site message is now helpful instead of making the user start over.

## Files changed

```text
src/app/admin/onboarding/page.tsx
src/app/api/admin/onboarding/route.ts
```

## Requirements

No new Supabase SQL migration is required.

No new Vercel environment variables are required.
