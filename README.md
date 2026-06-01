# CashOfferChat

AI seller intake assistant for cash home buyer websites.

## Current build: Phase 2C

This package includes:

- Marketing homepage
- We Buy Houses demo chat
- Hybrid AI Q&A + structured intake form
- Supabase conversation/message/lead storage
- Admin login
- Admin dashboard with lead filters
- Business settings and AI knowledge base
- Lead detail page with full seller/property details
- Conversation transcript view
- Lead status updates
- Internal admin notes
- Last-contacted tracking

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

Run these SQL files in Supabase SQL Editor, in order:

```bash
sql/001_initial_schema.sql
sql/002_business_settings.sql
sql/003_lead_management.sql
```

Phase 2C requires `sql/003_lead_management.sql` to add admin notes and last-contacted fields to seller leads.

## Admin pages

- `/admin/login` — login
- `/admin` — lead list with filters
- `/admin/leads/[id]` — lead detail, transcript, status, admin notes
- `/admin/settings` — business settings and AI knowledge base

## Local development

```bash
npm install
npm run dev
```
