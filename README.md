# CashOfferChat Phase 3D — Client Self-Service Settings

This phase lets business clients manage their own CashOfferChat settings from the client portal.

## What this adds

- Client settings page: `/client/settings`
- Client settings save route: `/api/client/settings`
- Business-scoped editing for:
  - business profile
  - service areas
  - referral areas
  - what they buy
  - what they do not buy
  - custom AI instructions
  - managed FAQs
  - widget branding
  - lead notification email
  - from email
  - allowed domains

## Security/scoping

Client users can only load and save settings for their own `business_id` from the signed client session cookie.

They cannot edit other businesses.

## SQL migration

No new Supabase SQL migration is required if these prior migrations have already been run:

```text
002_business_settings.sql
005_managed_faq_settings.sql
007_widget_branding_settings.sql
009_multi_company_foundation.sql
010_client_accounts.sql
```

## Environment variables

No new Vercel environment variables are required if `CLIENT_SESSION_SECRET` is already set.

## Testing checklist

1. Log in as a client at `/client/login`.
2. Go to `/client/settings`.
3. Update service areas, widget title, quote button text, and FAQs.
4. Save settings.
5. Test the widget using that client's `data-site-id`.
6. Confirm the widget uses the client-managed settings.
