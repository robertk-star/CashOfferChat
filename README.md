# CashOfferChat Phase 3M Hotfix — Webhook URL Type Fix

This fixes the Vercel TypeScript build error:

```text
Argument of type 'string | null | undefined' is not assignable to parameter of type 'string | Request | URL'
```

## File changed

```text
src/lib/leadWebhook.ts
```

## What changed

The webhook sender now narrows `settings.webhook_url` to a definite string before calling `fetch()`.

## Requirements

No SQL migration is required.

No new Vercel environment variables are required.
