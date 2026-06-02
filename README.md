# CashOfferChat Phase 3E Hotfix — Onboarding Business Table Repair

This fixes onboarding failures where the `businesses` table exists but is missing columns the onboarding route needs.

## Run this SQL migration

Run this in Supabase SQL Editor:

```text
sql/011_repair_businesses_columns.sql
```

## What this fixes

Adds missing columns to `businesses` if they do not exist:

- website
- phone
- email
- primary_market
- description
- is_active
- updated_at

## Also included

- The onboarding page now displays a more specific database error detail when available.
- The onboarding route now redirects with a safer error detail parameter for debugging.

## No new Vercel environment variables required.
