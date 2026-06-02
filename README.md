# CashOfferChat Phase 2F Hotfix — Managed FAQ Knowledge Base

This update changes the FAQ admin experience so the FAQ Knowledge Base is the managed answer list.

## What changed

- Replaced the separate Custom FAQ editor and read-only Default FAQ section with one managed FAQ Knowledge Base.
- Added a single "Add a new FAQ" box.
- Once a FAQ is added, it moves into the managed FAQ list.
- Every FAQ in the managed list has Edit and Remove controls.
- The original built-in default FAQs are loaded into the managed list until the business saves its own FAQ list.
- After saving, the widget uses the managed FAQ list from Supabase and does not fall back to default FAQ answers that were removed.

## Files changed

- `src/app/admin/settings/page.tsx`
- `src/app/api/admin/settings/route.ts`
- `src/app/api/chat/route.ts`
- `src/lib/businessSettings.ts`
- `src/components/ManagedFAQEditor.tsx`
- `sql/005_managed_faq_settings.sql`

## SQL migration required

Run this in Supabase SQL Editor after the prior migrations:

```sql
sql/005_managed_faq_settings.sql
```

This adds:

```sql
business_settings.use_custom_faq_knowledge_base
```

## Environment variables

No new Vercel environment variables are required.

## Testing

1. Go to `/admin/settings`.
2. Scroll to FAQ Knowledge Base.
3. Add a new FAQ using the single add box.
4. Confirm the FAQ appears in the managed list.
5. Edit an existing FAQ.
6. Remove an FAQ.
7. Save Business Settings.
8. Ask the widget a question that matches the edited FAQ.
9. Confirm the widget uses the saved answer.
