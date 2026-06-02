# CashOfferChat Phase 3G — System Health + Navigation Consolidation

This phase adds consistent navigation and a master system health page.

## What this adds

### Admin navigation

New shared component:

```text
src/components/AdminNav.tsx
```

Admin pages can use this component to show:

- Dashboard
- Businesses
- Onboarding
- Widget Sites
- Client Users
- Settings
- Analytics
- System
- Log Out

### Client navigation

New shared component:

```text
src/components/ClientNav.tsx
```

Client pages can use this component to show:

- Dashboard
- Settings
- Account
- Log Out

### System health page

New route:

```text
/admin/system
```

The page checks:

- Required environment variables
- Optional environment variables
- Supabase table reachability
- Key route file presence
- Overall system status

### System health API

New route:

```text
/api/admin/system/health
```

Returns JSON health information for admin troubleshooting.

## Files included

```text
src/components/AdminNav.tsx
src/components/ClientNav.tsx
src/lib/systemHealth.ts
src/app/admin/system/page.tsx
src/app/api/admin/system/health/route.ts
README.md
```

## SQL migration

No new SQL migration is required.

## Vercel environment variables

No new Vercel environment variables are required.
