# CashOfferChat Missing Routes Repair

I inspected the current GitHub zip and confirmed these routes were missing:

- `/admin/settings`
- `/admin/clients`
- `/admin/analytics`
- `/client/login`
- `/client`
- `/client/settings`
- `/client/account`

This package restores the missing pages and supporting API routes.

## Files included

```text
src/app/admin/settings/page.tsx
src/app/api/admin/settings/route.ts
src/app/admin/clients/page.tsx
src/app/api/admin/clients/route.ts
src/app/admin/analytics/page.tsx
src/app/client/login/page.tsx
src/app/api/client/login/route.ts
src/app/api/client/logout/route.ts
src/app/client/page.tsx
src/app/client/settings/page.tsx
src/app/api/client/settings/route.ts
src/app/client/account/page.tsx
src/app/api/client/account/password/route.ts
```

## SQL

No new SQL migration is included.

This repair assumes the prior SQL migrations have already created the relevant tables:

- `businesses`
- `business_settings`
- `business_users`
- `widget_sites`
- `seller_leads`
- `widget_events`

## Environment variables

No new Vercel environment variables are required beyond the ones already used:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_DASHBOARD_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `CLIENT_SESSION_SECRET`
- `APP_URL`
