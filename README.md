# CashOfferChat

AI seller intake assistant for cash home buyer websites.

## Current phase

Phase 2B adds a business settings and AI knowledge base layer.

Included:

- Marketing homepage
- We Buy Houses demo chat
- Hybrid AI Q&A + structured intake form
- Supabase lead and conversation storage
- Basic admin login and leads dashboard
- `/admin/settings` business settings page
- Business profile settings
- Buying-area settings
- Referral-area settings
- What-we-buy / what-we-do-not-buy criteria
- Custom Q&A knowledge base
- Custom AI instructions
- Chat route references business settings when answering questions

## Required environment variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
ADMIN_DASHBOARD_PASSWORD=
ADMIN_SESSION_SECRET=
LEAD_NOTIFICATION_EMAIL=
APP_URL=https://cashofferchat.com
```

`OPENAI_API_KEY` may be omitted during early testing. The chat route will use safe scripted fallback replies and business settings where possible.

## Supabase setup

Run these SQL files in order in the Supabase SQL editor:

```bash
sql/001_initial_schema.sql
sql/002_business_settings.sql
```

The Phase 2B migration is required before `/admin/settings` can save settings.

## Admin settings

After deploying and setting environment variables, go to:

```bash
/admin/login
```

Then open:

```bash
/admin/settings
```

Use that page to control:

- Business profile
- Cities the business buys in
- Cities where referral contacts exist
- Property types the business will buy
- Property types the business will not buy
- Custom question/answer pairs
- Freeform AI instructions

## Local development

```bash
npm install
npm run dev
```
