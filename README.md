# CashOfferChat Phase 2E Hotfix — Quote Intake Button

This hotfix improves the embeddable widget so sellers always have a clear, direct path to enter house information for a quote/property review.

## Changes

- Added a prominent always-visible button inside the widget: **Enter House Info for a Quote**.
- Clicking that button opens the structured intake form immediately.
- The **Get a review** quick action now opens the form instead of sending a chat message.
- Fixed the intake CTA wording and removed typo-prone button behavior.
- The intake form remains structured and submits to `/api/leads`.
- Chat remains available for Q&A.
- Source URL tracking is preserved.

## Files changed

- `public/widget.js`
- `README.md`

## SQL / environment variables

No new Supabase SQL migration is required.

No new Vercel environment variables are required.

## Testing

After deploy, open `/widget-demo`, open the widget, and click **Enter House Info for a Quote**. The structured intake form should appear immediately without sending a chat message.
