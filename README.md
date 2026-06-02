# CashOfferChat Phase 3E Hotfix — Onboarding Reliability + Website URL Normalization

This hotfix improves the onboarding flow.

## What changed

- Website no longer needs to be entered with `https://`.
- Website/domain inputs are normalized server-side.
- If the primary domain is blank, the route tries to infer it from the website.
- If allowed domains are blank, the route uses the primary domain.
- Duplicate Site IDs are checked before creating records.
- Onboarding errors now show a more specific message in the UI.
- The onboarding page preserves the embed-code success flow.

## Files changed

```text
src/lib/siteId.ts
src/app/admin/onboarding/page.tsx
src/app/api/admin/onboarding/route.ts
```

## Requirements

No new Supabase SQL migration is required.

No new Vercel environment variables are required.
