# CashOfferChat

AI seller intake assistant for cash home buyer websites.

## Phase 2F update

This package adds a controlled Default FAQ Knowledge Base for the widget/chat.

### What changed

- Added `src/lib/defaultFaqKnowledge.ts` with cash-buyer FAQ answers.
- Updated `/api/chat` to answer in this order:
  1. Business-specific Custom Q&A from `/admin/settings`
  2. Default FAQ Knowledge Base
  3. Business settings such as buying areas, referral areas, and buying criteria
  4. Safe generic fallback answer
- Updated the OpenAI prompt context so it references the default FAQ and does not browse the web or add unsupported claims.
- Added a read-only Default FAQ Knowledge Base section to `/admin/settings` so the admin can see the built-in answers.
- Custom Q&A remains the override mechanism. Add a custom answer to override a default FAQ answer for a specific business.

### SQL migrations

No new Supabase SQL migration is required for Phase 2F.

### Environment variables

No new Vercel environment variables are required.

### Test questions

Try these in `/widget-demo` or the widget:

- How is the cash offer determined?
- Do you pay full market value?
- Are there hidden fees or commissions?
- Do I need to clean the house or make repairs?
- What types of property situations do you buy?
- How fast can you close?
- Do I have to move out immediately?
- Am I obligated to sell if I request an offer?
- Can I sell if I already have an agent?

The widget should answer from the built-in FAQ knowledge base unless a Custom Q&A item in admin settings provides a more specific answer.
