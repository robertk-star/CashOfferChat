# CashOfferChat

AI seller intake assistant for cash home buyer websites.

## Current build

Phase 2F Hotfix — Add More FAQs in Settings

This update adds an editable FAQ builder to `/admin/settings` so the business can add as many custom FAQs as needed.

## What changed

- Added `src/components/CustomFAQEditor.tsx`
- Replaced the fixed 6-row Q&A section with a dynamic FAQ editor
- Added an `Add Another FAQ` button
- Added a `Remove` button for each FAQ row
- Custom FAQs still save to the existing `custom_qa_items` table
- The widget continues to prioritize Custom FAQ / Q&A answers before default FAQ answers

## Required SQL

No new Supabase SQL migration is required.

The existing Phase 2B table is used:

```sql
custom_qa_items
```

## Required environment variables

No new Vercel environment variables are required.

## Testing

1. Log in to `/admin/login`.
2. Open `/admin/settings`.
3. Go to `Custom FAQ / Q&A Knowledge Base`.
4. Click `Add Another FAQ`.
5. Add a question and answer.
6. Save Business Settings.
7. Ask the widget a matching question.
8. Confirm the widget uses the custom answer before the default FAQ answer.
