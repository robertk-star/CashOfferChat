# CashOfferChat Phase 3G Hotfix — Navigation Label Cleanup

This hotfix clarifies portal navigation labels.

## What changed

- Global admin nav now clearly separates:
  - Admin Dashboard
  - System Dashboard
- Global client nav clearly shows:
  - Client Dashboard
- Existing page-level links that say `Back to Admin` are clarified in the browser to:
  - `Back to Admin Dashboard`
- Existing page-level links that say `Back to Client Dashboard` remain clear.
- System Dashboard remains visible from every admin route through the global nav.

## File changed

```text
src/components/PortalRouteNav.tsx
```

## SQL migration

No SQL migration is required.

## Vercel environment variables

No new Vercel environment variables are required.
