# CashOfferChat AI FAQ Quality Phase

This package adds the approved Top 100 seller FAQ library on top of the lead delete/reset phase.

## What changed

### Top 100 approved FAQ answers

- Replaced the small default FAQ fallback list in `src/lib/defaultFaqKnowledge.ts` with the full approved Top 100 seller questions and answers.
- The chat API already checks answers in this order:
  1. Business custom Q&A
  2. Business managed FAQs
  3. Global default FAQ library
  4. Business rules/service areas
  5. Safe fallback answer
- Because the approved list is now the global default FAQ library, the widget can answer common seller questions even before a business has custom FAQs configured.

### Admin FAQ import button

- Added an **Import Top 100 FAQs** button to `/admin/settings`.
- The button copies the approved Top 100 seller FAQs into the selected business's Managed FAQs.
- Importing replaces that business's current Managed FAQs so the answers can be reviewed, edited, removed, or saved from the existing settings screen.

### New admin route

- Added `src/app/api/admin/settings/faqs/import-defaults/route.ts`.
- The route requires the existing admin session cookie.
- The route uses existing `managed_faq_items` rows and does not require a schema change.

## Files changed

```text
README.md
src/lib/defaultFaqKnowledge.ts
src/app/admin/settings/page.tsx
src/app/api/admin/settings/faqs/import-defaults/route.ts
```

## SQL migration

No new SQL migration is required for this phase.

This phase uses the existing `managed_faq_items` table already included in the current migrations through `sql/017_multibusiness_settings_fix.sql`.

## Vercel environment variables

No new Vercel environment variables are required for this phase.

The app still requires the existing project environment variables already documented in prior phases, including Supabase service role access and session secrets.

## What should be visible after upload/deploy

- The widget should answer the common seller questions from the approved Top 100 FAQ library.
- Admin can go to `/admin/settings` and click **Import Top 100 FAQs**.
- After import, the Managed FAQs section should show the full Top 100 list for that business.
- Admin can edit or remove individual approved FAQ answers after importing.
- No public UI redesign is expected from this phase.


### FAQ visibility repair phase

This package adds a dedicated admin FAQ page at `/admin/faqs`. The page shows both the built-in Global Top 100 FAQ Library and the selected business's Managed FAQs. It also provides a visible `Import Top 100 FAQs` action so admins can copy the global FAQs into a business and verify that all 100 questions were imported.

SQL migration needed: No.

Vercel ENV needed: No new variables.
