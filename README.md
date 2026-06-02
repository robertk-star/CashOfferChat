# CashOfferChat Phase 3E Stabilization — Onboarding Schema Repair

This package is meant to stop the repeated onboarding failures caused by mismatches between the app code and your current Supabase tables.

## What this fixes

The error you just received was:

```text
Could not find the 'business_description' column of 'business_settings'
```

This package adds a stronger repair migration that ensures the main tables used by onboarding have the columns the app expects.

## Run this SQL first

Run this in Supabase SQL Editor:

```text
sql/013_stabilize_onboarding_schema.sql
```

## Then upload/deploy the code files

Files included:

```text
src/app/api/admin/onboarding/route.ts
src/app/admin/onboarding/page.tsx
```

## No new Vercel environment variables required.

## Important

After running the SQL and deploying this package, try onboarding again.

If another database mismatch appears, the error message should now be specific enough to fix directly.
