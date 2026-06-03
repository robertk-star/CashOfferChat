# CashOfferChat Phase 3P Hotfix — Widget FAQ Answer Quality

This hotfix fixes the widget returning the same generic answer to different seller questions.

## Problem

The widget was answering questions like:

- "Do you buy as-is?"
- "How fast can I close?"

with the same generic fallback response.

## What changed

Updated:

```text
src/app/api/chat/route.ts
src/lib/defaultFaqKnowledge.ts
```

The chat API now answers in this order:

1. Business-specific managed FAQs
2. Legacy custom Q&A items, if present
3. Default cash-buyer FAQ knowledge base
4. Business service-area / buying-criteria rules
5. Safe fallback answer

## Improved answers for

- Do you buy as-is?
- How fast can I close?
- Do I need repairs?
- Do you buy houses with tenants?
- Are there fees or commissions?
- Do you pay full market value?
- Am I obligated to sell?
- Can I sell if I already have an agent?
- Can you stop foreclosure?
- Do I have to move out immediately?
- What types of properties do you buy?

## SQL migration

No SQL migration is required.

## Vercel environment variables

No new Vercel environment variables are required.

## Testing

After deploying, test `/demo` and ask:

```text
Do you buy as-is?
How fast can I close?
Do I need repairs?
Do you buy with tenants?
Are there fees?
Am I obligated to sell?
```

Each should produce a different specific answer.
