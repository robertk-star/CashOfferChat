# CashOfferChat Phase 3D Hotfix — Default FAQ Import Fix

This hotfix fixes the Vercel build error:

```text
Attempted import error: 'getDefaultFaqItems' is not exported from '@/lib/defaultFaqKnowledge'
```

## File changed

```text
src/lib/clientSettingsData.ts
```

## What changed

The client settings helper no longer imports `getDefaultFaqItems`. It now uses a local fallback FAQ list when a business does not yet have managed FAQs saved.

## Requirements

No new Supabase SQL migration is required.

No new Vercel environment variables are required.
