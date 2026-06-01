# CashOfferChat

AI seller intake assistant for cash home buyer websites.

## Phase 2A-R scope

This revision separates AI Q&A from reliable lead capture:

- The chat answers seller questions about as-is sales, timelines, repairs, tenants, fees, inherited properties, and service area.
- The chat opens a structured intake form when the seller asks for an offer, property review, or follow-up.
- The AI does not guess form fields from ambiguous chat text.
- Lead data is captured through controlled form fields and saved through `/api/leads`.
- Conversation messages are still stored when Supabase is configured.

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

`OPENAI_API_KEY` may be omitted during early testing. The chat route will use safe scripted replies.

## Supabase setup

Run `sql/001_initial_schema.sql` in the Supabase SQL editor before testing lead or conversation storage.

No new SQL migration is required for Phase 2A-R.

## Local development

```bash
npm install
npm run dev
```

## Test flow

Try these chat messages:

- Do you buy as-is?
- How fast can I close?
- Do you buy houses with tenants?
- Can you take a look at it?

Expected behavior: the chat answers questions without trying to fill lead fields from free text. When the seller asks for review or an offer, the structured intake form opens.
