# CashOfferChat

AI seller intake assistant for cash home buyer websites.

## Phase 1 scope

This build includes a single-company We Buy Houses demo/foundation:

- Marketing homepage
- Demo seller chat page
- AI chat API route with safe fallback replies
- Supabase conversation/message/lead storage
- Basic admin login and leads dashboard
- SQL migration file

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
```

`OPENAI_API_KEY` may be omitted during early testing. The chat route will use safe scripted fallback replies.

## Supabase setup

Run `sql/001_initial_schema.sql` in the Supabase SQL editor before testing lead or conversation storage.

## Local development

```bash
npm install
npm run dev
```
