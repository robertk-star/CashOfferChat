# CashOfferChat

AI seller intake assistant for cash home buyer websites.

## Current build

This package includes Phase 2D:

- Marketing homepage
- We Buy Houses demo chat
- Hybrid AI Q&A + structured lead intake form
- Supabase conversation/message/lead storage
- Admin login
- Admin lead dashboard
- Lead detail page with transcript, status, admin notes, and notification status
- Business settings and AI knowledge base
- Email notifications for new leads using Resend

## Required Supabase migrations

Run these in order in the Supabase SQL Editor:

```sql
sql/001_initial_schema.sql
sql/002_business_settings.sql
sql/003_lead_management.sql
sql/004_lead_notifications.sql
```

Phase 2D adds `notification_sent_at` and `notification_error` to `seller_leads`, plus `lead_notification_email` and `from_email` to `business_settings`.

## Required environment variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini

ADMIN_DASHBOARD_PASSWORD=
ADMIN_SESSION_SECRET=
APP_URL=https://cashofferchat.com

RESEND_API_KEY=
LEAD_NOTIFICATION_EMAIL=
FROM_EMAIL=
```

`OPENAI_API_KEY` may be omitted during early testing. The chat route will use safe scripted fallback replies.

`RESEND_API_KEY` is required for lead notification emails. If it is missing, the lead will still be saved and the lead detail page will show the notification error.

`LEAD_NOTIFICATION_EMAIL` is used as a fallback. The preferred notification email can also be set in `/admin/settings`.

`FROM_EMAIL` is used as a fallback sending address. The preferred sender can also be set in `/admin/settings`. For production, configure a verified sending domain in Resend.

## Local development

```bash
npm install
npm run dev
```

## Phase 2D Hotfix — Required phone field

This hotfix makes the structured intake form match the lead API requirements. The form now clearly asks for a required phone number, marks required fields, validates before submit, and displays specific validation/API errors. Email notification errors are non-blocking, so a lead can still save if Resend is not configured or sending fails.

No new SQL migration is required for this hotfix.
No new Vercel environment variables are required for this hotfix.
