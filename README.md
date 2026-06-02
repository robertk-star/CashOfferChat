# CashOfferChat

AI seller intake assistant for cash home buyer websites.

## Current demo focus

This package updates the demo/business defaults from the Austin area to the Plano/North Texas area and references the demo site `sellmyhousetodayanywhere.com`.

Default demo values:

- Business name: Sell My House Today Anywhere
- Website: https://sellmyhousetodayanywhere.com/
- Demo phone placeholder: 972-555-0100
- Primary market: Plano, Texas and nearby North Texas areas
- Default service areas: Plano, Frisco, McKinney, Allen, Richardson, Carrollton, Garland, Lewisville, Dallas

Replace the placeholder phone number in `/admin/settings` when you have the real business phone number.

## Supabase migrations

Run migrations in order:

1. `sql/001_initial_schema.sql`
2. `sql/002_business_settings.sql`
3. `sql/003_lead_management.sql`
4. `sql/004_lead_notifications.sql`
5. `sql/005_managed_faq_settings.sql`
6. `sql/006_plano_demo_defaults.sql` — only needed if the project was previously seeded with Austin demo settings or you want to reset defaults to Plano.

## Widget demo site

For `sellmyhousetodayanywhere.com`, install the widget with:

```html
<script src="https://cashofferchat.com/widget.js" data-site-id="demo"></script>
```

Keep `APP_URL=https://cashofferchat.com` in the CashOfferChat Vercel project so the admin embed code references the production widget domain.

## Required environment variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
ADMIN_DASHBOARD_PASSWORD=
ADMIN_SESSION_SECRET=
LEAD_NOTIFICATION_EMAIL=
APP_URL=https://cashofferchat.com
RESEND_API_KEY=
FROM_EMAIL=
```

`OPENAI_API_KEY` and `RESEND_API_KEY` may be omitted during early testing, but email notifications require Resend configuration.


## Phase 2H Widget Branding + Demo Site Settings

Run the new migration after the previous migrations:

7. `sql/007_widget_branding_settings.sql`

This adds admin-controlled widget settings:

- widget title and subtitle
- bubble text
- quote/intake button text
- success message
- header color
- button color
- call button visibility/text
- allowed domains for demo/customer installs

The widget now loads these settings from `/api/widget/settings`, so the embed code can stay simple:

```html
<script src="https://cashofferchat.com/widget.js" data-site-id="demo"></script>
```

The allowed-domain check is currently a soft warning for demo testing; it does not block the widget yet.

## Phase 2I - Widget Analytics

This update adds basic widget event tracking and an admin analytics page.

New route:

```text
/admin/analytics
```

New public API endpoint:

```text
/api/widget/events
```

Tracked events include:

```text
widget_loaded
widget_opened
widget_closed
chat_message_sent
chat_response_received
quote_form_opened
quote_form_closed
lead_form_submitted
lead_saved
lead_save_failed
lead_submitted
```

Run the new Supabase migration after all previous migrations:

```text
sql/008_widget_analytics.sql
```

No new Vercel environment variables are required.
