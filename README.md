# CashOfferChat Phase 3H — Client Lead Detail + Lead Management

This phase improves the client portal so business clients can actually work their leads.

## What this adds

- Client lead detail page:

```text
/client/leads/[id]
```

- Client lead update route:

```text
/api/client/leads/[id]
```

- Updated client dashboard:

```text
/client
```

## Client can now

- Open each lead from the client dashboard
- View full seller/property details
- View conversation transcript when available
- Update lead status
- Add internal notes
- Set last-contacted timestamp

## Status options

- New
- Contacted
- Appointment Set
- Offer Made
- Under Contract
- Closed
- Not Interested
- Bad Lead
- Referral

## Security

Client lead detail pages are scoped by `business_id` from the signed client session cookie.

A client can only view/update leads belonging to their own business.

## SQL migration

No new SQL migration is required if previous migrations were already run.

This phase uses existing columns from earlier migrations:

```text
seller_leads.admin_notes
seller_leads.last_contacted_at
```

If those columns are missing, rerun:

```text
sql/003_lead_management.sql
```

## Environment variables

No new Vercel environment variables are required.
