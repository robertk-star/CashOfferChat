# CashOfferChat Repository Core Repair

Your uploaded GitHub zip is missing the core Next.js app files and shared libraries.

The Vercel error:

```text
admin/businesses/page.tsx doesn't have a root layout
```

happens because `src/app/layout.tsx` is missing.

The uploaded repo also does not include shared files required by the new admin pages, including:

```text
src/lib/auth.ts
src/lib/supabaseAdmin.ts
src/lib/clientAuth.ts
src/lib/siteId.ts
```

This repair package adds the missing core files.

## Files included

```text
src/app/layout.tsx
src/app/globals.css
src/app/page.tsx
src/app/admin/page.tsx
src/app/admin/login/page.tsx
src/app/api/admin/login/route.ts
src/app/api/admin/logout/route.ts
src/lib/auth.ts
src/lib/supabaseAdmin.ts
src/lib/clientAuth.ts
src/lib/siteId.ts
```

## SQL migration

No SQL migration is required for this repair.

## Vercel environment variables

No new Vercel variables are required, but these must already be present for admin/database features:

```text
ADMIN_DASHBOARD_PASSWORD
ADMIN_SESSION_SECRET
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```
