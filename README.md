# CashOfferChat Phase 3J Hotfix — Analytics event_type + Duplicate Logout Cleanup

This hotfix fixes two issues.

## 1. Analytics error

Error:

```text
column widget_events.event_type does not exist
```

Run this SQL repair:

```text
sql/015_widget_events_event_type_repair.sql
```

It safely adds/populates:

```text
widget_events.event_type
widget_events.site_id
widget_events.domain
widget_events.page_url
widget_events.lead_id
widget_events.conversation_id
widget_events.business_id
widget_events.metadata
```

## 2. Duplicate logout buttons

The global portal nav already has a logout button, but many older pages also have their own logout button.

This update changes:

```text
src/components/PortalRouteNav.tsx
```

It hides duplicate logout forms on admin/client pages after the global nav loads, leaving only one logout button visible.

## Files included

```text
sql/015_widget_events_event_type_repair.sql
src/components/PortalRouteNav.tsx
README.md
```

## Requirements

Run the SQL repair first, then deploy the code.

No new Vercel environment variables are required.
