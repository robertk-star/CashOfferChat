# CashOfferChat Phase 3E Hotfix — Business Slug + Required Field Clarity

This hotfix fixes the onboarding error:

```text
null value in column "slug" of relation "businesses" violates not-null constraint
```

## What changed

- The onboarding API now automatically creates `slug` from the business name.
- If the generated slug already exists, it appends a short unique suffix.
- The onboarding form now makes the backend-required fields clear:
  - Business Name *
  - Site ID *
- Optional client-login fields are clearly marked as required only if "Create client login" is checked.
- The onboarding API now includes `slug` when inserting a new business.

## SQL migration

Run this repair SQL in Supabase before testing again:

```text
sql/012_repair_business_slug.sql
```

It ensures the `slug` column exists and fills any missing slugs for existing businesses.

## Environment variables

No new Vercel environment variables are required.
