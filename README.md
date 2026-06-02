# CashOfferChat Phase 3O — Public Sales Page + Homepage Widget Demo

This phase turns `cashofferchat.com` into a public-facing SaaS sales website.

## What this adds

Public pages:

```text
/
 /demo
 /pricing
 /contact
 /privacy
 /terms
```

## Homepage

The homepage now positions CashOfferChat as:

```text
AI chat that helps cash home buyers capture and qualify more seller leads
```

It includes:

- Hero section
- CTA buttons
- Product positioning
- Feature cards
- How it works
- Widget demo section
- Pricing preview
- FAQ
- Final CTA
- Footer
- Widget loaded with `data-site-id="demo"`

## Demo page

`/demo` explains how to test the widget and embeds the widget with:

```html
<script src="/widget.js" data-site-id="demo"></script>
```

## Pricing page

`/pricing` shows early package concepts:

- Starter
- Growth
- Pro

No Stripe or billing is added yet.

## Contact page

`/contact` includes a simple early access/setup inquiry form mockup.

The form is intentionally non-functional for now.

## Legal pages

Basic placeholder pages:

- `/privacy`
- `/terms`

These should be reviewed by an attorney before public launch.

## SQL migration

No SQL migration is required.

## Vercel environment variables

No new Vercel environment variables are required.

## Important

This does not add Stripe.

Stripe remains a later/final build.
