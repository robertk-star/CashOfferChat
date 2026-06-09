# CashOfferChat

CashOfferChat is an AI chat widget and lead intake tool for cash home buyer websites.

## Current sellable build

The app includes:

- Public CashOfferChat marketing site
- Live demo link to `https://www.sellmyhousetodayanywhere.com/`
- Embeddable widget script
- Client dashboard
- Admin dashboard
- Lead capture
- Lead detail pages
- Delete/reset lead handling
- Widget settings for title, subtitle, phone visibility, header colors, and button colors
- Top 100 seller FAQ answer library
- Optional webhook lead delivery
- Email notification for new leads

## Lead email notifications

When a seller submits the widget form, `/api/leads` saves the lead and then tries to send an email notification.

Email delivery is non-blocking. If email delivery fails, the lead still saves in the dashboard.

### Recipients

Lead notification emails go to:

1. Active client users attached to the same business in `business_users`
2. Any emails listed in the optional `LEAD_NOTIFICATION_EMAIL` environment variable

`LEAD_NOTIFICATION_EMAIL` may contain one or more emails separated by commas, semicolons, or new lines.

### Required Vercel ENV for email notifications

```text
RESEND_API_KEY
FROM_EMAIL
```

Recommended:

```text
FROM_EMAIL=CashOfferChat <leads@cashofferchat.com>
```

Optional fallback/copy recipients:

```text
LEAD_NOTIFICATION_EMAIL=you@example.com
```

## Core required Vercel ENV

```text
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
ADMIN_DASHBOARD_PASSWORD
ADMIN_SESSION_SECRET
CLIENT_SESSION_SECRET
APP_URL
```

## SQL migrations

Run SQL files in order from the `sql/` folder.

The latest added migration is:

```text
sql/018_widget_color_text_controls.sql
```

No new SQL migration is required for lead email notifications.

## Widget script

Widget install scripts should use the canonical `www` host:

```html
<script src="https://www.cashofferchat.com/widget.js?v=send-green-canonical-api-20260607a" data-site-id="smhta"></script>
```

## Repo cleanup note

The active project root is the repository root. Do not upload builds into nested folders such as:

```text
CashOfferChat-main/
coc_combined_fix/
temp_extract/
```

Those paths are ignored and excluded from TypeScript builds.
