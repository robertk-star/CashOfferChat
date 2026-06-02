# CashOfferChat Phase 3L — Lead Export + CSV Downloads

This phase adds CSV lead export tools for both master admin and clients.

## What this adds

### Admin exports

```text
/api/admin/leads/export
```

Master admin can export all leads, optionally filtered by:

```text
businessId
siteId
status
```

Example:

```text
/admin/leads/export?status=new
/api/admin/leads/export?businessId=<business-id>
/api/admin/leads/export?siteId=demo
```

### Client exports

```text
/api/client/leads/export
```

Clients can export only leads tied to their own business.

Optional filter:

```text
status
siteId
```

Example:

```text
/api/client/leads/export?status=new
/api/client/leads/export?siteId=demo
```

### Export buttons

This package also adds reusable export button components:

```text
src/components/AdminLeadExportButton.tsx
src/components/ClientLeadExportButton.tsx
```

These can be placed on dashboard pages.

## CSV fields

The CSV includes:

- Created At
- Status
- Seller Name
- Phone
- Email
- Property Address
- Property City
- Situation
- Timeline
- Property Condition
- Seller Notes
- Admin/Internal Notes
- Source URL
- Site ID
- Business ID

## Security

- Admin export requires admin cookie.
- Client export requires client cookie and is scoped by session `businessId`.

## SQL migration

No SQL migration is required.

## Vercel environment variables

No new Vercel environment variables are required.
