# CashOfferChat Lead Delete & Reset Phase

This package adds lead deletion/reset handling on top of the stabilization phase.

## What changed

### Lead deletion/reset

- Added a shared server helper at `src/lib/deleteLeadReset.ts`.
- Added admin lead delete/reset support from `/admin/leads/[id]`.
- Added client lead delete/reset support from `/client/leads/[id]`.
- Added confirmation fields requiring the user to type `DELETE` before the delete action runs.
- Added success/error messaging after deletion.

### Reset behavior

When a lead is deleted, the server now clears the lead and related tracking records so the deleted lead does not continue to look like a received lead:

- Deletes related `widget_events` by `lead_id` and related `conversation_id`.
- Deletes the `seller_leads` row.
- Deletes the related `conversations` row when no other lead still uses that conversation.
- Conversation messages are removed through the existing `conversation_messages` cascade from `conversations`.

### Re-submit protection

- Updated `/api/leads` so if a browser submits a lead with an old/deleted `conversationId`, the API ignores that stale ID instead of failing the insert.
- Updated `/api/chat` so if a browser keeps an old/deleted `conversationId`, the chat API creates a fresh conversation instead of trying to reuse a deleted one.

## Files changed

```text
README.md
src/app/admin/businesses/page.tsx
src/app/admin/businesses/[id]/page.tsx
src/app/admin/leads/[id]/page.tsx
src/app/api/admin/leads/[id]/route.ts
src/app/api/chat/route.ts
src/app/api/client/leads/[id]/route.ts
src/app/api/leads/route.ts
src/app/client/leads/[id]/page.tsx
src/app/client/page.tsx
src/lib/deleteLeadReset.ts
```

## SQL migration

No new SQL migration is required for this phase.

This phase uses the existing tables and foreign-key behavior already included in the current migrations through `sql/017_multibusiness_settings_fix.sql`.

## Vercel environment variables

No new Vercel environment variables are required for this phase.

The app still requires the existing project environment variables already documented in prior phases, including Supabase service role access and session secrets.

## What should be visible after upload/deploy

- Admin can open `/admin/leads/[id]` and see a new **Delete & Reset Lead** section.
- Client users can open `/client/leads/[id]` and see a new **Delete & Reset Lead** section.
- The delete action requires typing `DELETE` before it submits.
- After deletion, the lead disappears from the dashboard/list counts.
- Related widget events and conversation transcript records are cleared.
- If the same seller submits again, the deleted lead should not block the new submission or behave like a duplicate.
