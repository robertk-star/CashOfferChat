# CashOfferChat Phase 3K — Client Widget Sites + Install Center

This phase gives clients a self-service place to manage their widget install details.

## What this adds

- Client widget sites list:

```text
/client/sites
```

- Client widget site detail/edit page:

```text
/client/sites/[id]
```

- Client widget site update route:

```text
/api/client/sites/[id]
```

- Updated global client navigation:

```text
src/components/PortalRouteNav.tsx
```

## Clients can now

- See their own widget sites
- Copy the embed code for each site
- See install instructions
- See allowed domains
- Edit:
  - site display name
  - primary domain
  - allowed domains
  - active/inactive status
- See recent leads for that site
- See recent widget events for that site

## Security

Client site pages are scoped by `business_id` from the signed client session cookie.

A client can only see/update widget sites tied to their own business.

## SQL migration

No new SQL migration is required.

This phase uses the existing `widget_sites`, `seller_leads`, and `widget_events` tables.

## Environment variables

No new Vercel environment variables are required.
