# CashOfferChat Phase 3I — Widget Site Management

This phase improves master-admin management of widget sites.

## What this adds

- Widget site detail/edit page:

```text
/admin/sites/[id]
```

- Widget site update route:

```text
/api/admin/sites/[id]
```

- Updated widget sites list page:

```text
/admin/sites
```

## Master admin can now

- Open a widget site from the list
- Edit:
  - site display name
  - site ID
  - business assignment
  - primary domain
  - allowed domains
  - active/inactive status
- See the exact embed code
- See recent leads from that site
- See recent widget events from that site
- Copy installation guidance from the page

## SQL migration

No new SQL migration is required if previous migrations are installed.

This phase expects:

```text
widget_sites.name
widget_sites.site_name
widget_sites.site_id
widget_sites.domain
widget_sites.allowed_domains
widget_sites.is_active
widget_sites.business_id
```

If your `widget_sites` schema is still inconsistent, rerun the stabilization SQL from Phase 3E:

```text
sql/013_stabilize_onboarding_schema.sql
```

## Environment variables

No new Vercel environment variables are required.
