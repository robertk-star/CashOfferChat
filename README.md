# CashOfferChat Hotfix — Multi-Business Settings

This fixes the onboarding error:

```text
duplicate key value violates unique constraint "business_settings_singleton_key_key"
Key (singleton_key)=(default) already exists.
```

## What happened

`business_settings` was originally created for a single-business/demo setup. It has an old unique constraint on `singleton_key`, which only allows one settings row.

Now CashOfferChat is multi-business, so each business needs its own settings row.

## SQL migration required

Run this in Supabase SQL Editor:

```text
sql/017_multibusiness_settings_fix.sql
```

This migration:

- Adds `business_id` if missing
- Drops the old singleton unique constraint
- Creates a unique index on `business_id`
- Keeps `singleton_key` if it exists, but makes it harmless by setting it uniquely per business/settings row

## Code changes

Updates onboarding so business settings are saved with `upsert(... onConflict: "business_id")` instead of a plain insert.

## Files included

```text
sql/017_multibusiness_settings_fix.sql
src/app/api/admin/onboarding/route.ts
README.md
```

## Vercel environment variables

No new Vercel environment variables are required.
