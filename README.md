# CashOfferChat Phase 3B Hotfix — Admin Clients Type Fix

This hotfix fixes the Vercel TypeScript compile error in:

```text
src/app/admin/clients/page.tsx
```

## Issue fixed

Supabase returned the joined `businesses` value as an array, while the TypeScript type expected a single object.

The page now accepts either shape:

```text
{ name: string }
{ name: string }[]
null
```

and safely displays the first business name when an array is returned.

## Requirements

No new SQL migration is required.

No new Vercel environment variables are required.
