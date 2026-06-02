# CashOfferChat Phase 3G Hotfix — Global Portal Navigation

This hotfix adds a consistent navigation bar across all admin and client portal pages.

## What this adds

- Global portal navigation component:
  - `src/components/PortalRouteNav.tsx`

- Updated root layout:
  - `src/app/layout.tsx`

## Behavior

The navigation automatically appears on admin routes:

```text
/admin
/admin/businesses
/admin/onboarding
/admin/sites
/admin/clients
/admin/settings
/admin/analytics
/admin/system
/admin/leads/[id]
```

It does not appear on:

```text
/admin/login
```

The navigation automatically appears on client routes:

```text
/client
/client/settings
/client/account
/client/leads/[id]
```

It does not appear on:

```text
/client/login
```

## Admin links shown

- Admin Dashboard
- Businesses
- Onboarding
- Widget Sites
- Client Users
- Settings
- Analytics
- System
- Log Out

## Client links shown

- Client Dashboard
- Settings
- Account
- Log Out

## SQL migration

No SQL migration is required.

## Vercel environment variables

No new Vercel environment variables are required.
