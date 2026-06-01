# CashOfferChat

AI seller intake assistant for cash home buyer websites.

## Current build

This package includes Phase 2E:

- Marketing homepage
- We Buy Houses demo chat
- Hybrid AI Q&A + structured lead intake form
- Supabase conversation/message/lead storage
- Admin login
- Admin lead dashboard
- Lead detail page with transcript, status, admin notes, and notification status
- Business settings and AI knowledge base
- Email notifications for new leads using Resend
- Embeddable website widget at `/widget.js`
- Widget preview page at `/widget-demo`
- Embed code displayed in `/admin/settings`

## Phase 2E — Embeddable Widget

The widget can be installed on a cash home buyer website with:

```html
<script src="https://cashofferchat.com/widget.js" data-site-id="demo"></script>
```

The Phase 2E widget:

- Loads as a bottom-right chat bubble
- Answers seller questions through `/api/chat`
- Opens a structured intake form when the seller requests a review or offer
- Saves leads through `/api/leads`
- Tracks the source page URL
- Uses CORS headers on the chat and lead APIs so the widget can run on other websites

Phase 2E still uses `data-site-id="demo"`. Multi-company site IDs and domain allowlists should be added later.

## Required Supabase migrations

Run these in order in the Supabase SQL Editor:

```sql
sql/001_initial_schema.sql
sql/002_business_settings.sql
sql/003_lead_management.sql
sql/004_lead_notifications.sql
```

No new SQL migration is required for Phase 2E.

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

`APP_URL` is used to display the correct widget embed code in the admin settings page.

`OPENAI_API_KEY` may be omitted during early testing. The chat route will use safe scripted fallback replies.

`RESEND_API_KEY` is required for lead notification emails. If it is missing, the lead will still be saved and the lead detail page will show the notification error.

`LEAD_NOTIFICATION_EMAIL` is used as a fallback. The preferred notification email can also be set in `/admin/settings`.

`FROM_EMAIL` is used as a fallback sending address. The preferred sender can also be set in `/admin/settings`. For production, configure a verified sending domain in Resend.

## Local development

```bash
npm install
npm run dev
```

## Testing Phase 2E

1. Deploy the package.
2. Visit `/admin/settings` and copy the embed code.
3. Visit `/widget-demo` and test the bottom-right widget.
4. Ask questions such as:
   - Do you buy as-is?
   - How fast can I close?
   - Do you buy houses with tenants?
   - Can you take a look at it?
5. Submit a test lead from the widget intake form.
6. Confirm the lead appears in Supabase and `/admin`.

No new Supabase SQL migration is required for Phase 2E.
No new Vercel environment variables are required beyond the existing `APP_URL` recommendation.
