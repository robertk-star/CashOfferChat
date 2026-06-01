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

## Phase 2A.1 fix

This package preserves client-side intake state when Supabase conversation persistence is unavailable, preventing the chat from asking the same intake question twice during demo/testing.

## Phase 2A state-machine update

This update changes the demo chat from loose extraction to a Q&A + guided intake state machine.

Key behavior:

- The assistant answers seller questions first.
- It asks only one intake question at a time.
- It tracks `lastAskedField` so answers like `Front st` are saved as the address when the previous assistant prompt asked for address.
- It does not infer seller details from general questions such as `Do you buy as-is?`.
- It asks for contact information only after property basics are collected and the seller gives permission for follow-up.
- No new SQL migration is required.
- No new Vercel environment variables are required.

Recommended test flow:

1. `Do you buy as-is?`
2. `Austin`
3. `Front st`
4. `Needs repairs`
5. `ASAP`
6. `Needs roof work`
7. The assistant should ask permission for follow-up before asking for name, phone, or email.
