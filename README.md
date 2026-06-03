# CashOfferChat Phase 3P — Widget Polish + Mobile UX

This phase improves the customer-facing embeddable widget.

## What this adds

Updated:

```text
public/widget.js
```

## Widget improvements

- Cleaner widget bubble
- Better mobile sizing
- Better desktop sizing
- Stronger top CTA button
- Clear quote/intake form view
- Back-to-chat behavior
- Better success screen
- Better error handling
- Better loading states
- Source URL tracking
- Site ID tracking
- Widget event tracking
- Settings loaded from `/api/widget/settings`
- Chat still uses `/api/chat`
- Lead form still uses `/api/leads`
- Event tracking still uses `/api/widget/events`

## User-facing widget flow

1. User sees a bottom-right chat bubble.
2. User opens the widget.
3. User can ask questions.
4. User can click **Enter House Info for a Quote**.
5. User completes structured lead form.
6. Lead submits to CashOfferChat.
7. Success screen appears.
8. User can return to chat or close the widget.

## SQL migration

No SQL migration is required.

## Vercel environment variables

No new Vercel environment variables are required.

## Test checklist

After deploying:

1. Open `/demo`
2. Open the widget
3. Ask: `Do you buy as-is?`
4. Click `Enter House Info for a Quote`
5. Submit a test lead with:
   - name
   - phone
   - city or address
6. Confirm success screen appears
7. Confirm lead appears in `/admin` and `/client`
8. Confirm events appear in analytics
