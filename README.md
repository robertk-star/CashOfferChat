# CashOfferChat Phase 3E Hotfix — Widget Site Name Column

This hotfix fixes the onboarding error:

```text
null value in column "name" of relation "widget_sites" violates not-null constraint
```

## What changed

The onboarding route now sends both fields when creating a widget site:

```text
name
site_name
```

Both use the same site display name.

## File changed

```text
src/app/api/admin/onboarding/route.ts
```

No new Supabase SQL migration is required.

No new Vercel environment variables are required.
