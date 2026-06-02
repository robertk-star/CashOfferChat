# CashOfferChat Phase 3J — Client Analytics Dashboard

This phase adds business-scoped analytics to the client portal.

## What this adds

- Client analytics page:

```text
/client/analytics
```

- Updated global portal navigation:

```text
src/components/PortalRouteNav.tsx
```

## Clients can now see

- Widget events in the last 7 days
- Leads in the last 7 days
- Lead conversion rate based on widget events
- Events by type
- Events by domain
- Events by site ID
- Recent widget events
- Recent leads
- Links to client lead detail pages

## Security

The analytics page is scoped by the `business_id` from the signed client session cookie.

Clients only see events and leads for their own business.

## SQL migration

No new SQL migration is required.

This phase uses existing tables:

```text
widget_events
seller_leads
widget_sites
businesses
```

## Environment variables

No new Vercel environment variables are required.
