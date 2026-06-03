# CashOfferChat Phase 3Q — Sell My House Today Anywhere Demo Site

This phase adds a public home-buying demo website called:

```text
Sell My House Today Anywhere
```

The goal is to use this as a realistic "we buy houses" demo site with the CashOfferChat widget embedded.

## What this adds

### New demo website route

```text
/sellmyhousetodayanywhere
```

### Host-based routing middleware

```text
middleware.ts
```

When a visitor goes to:

```text
https://sellmyhousetodayanywhere.com
https://www.sellmyhousetodayanywhere.com
```

the app rewrites the homepage request to:

```text
/sellmyhousetodayanywhere
```

This lets:

```text
cashofferchat.com
```

remain the CashOfferChat SaaS sales site, while:

```text
sellmyhousetodayanywhere.com
```

shows the demo cash home buyer site.

## Widget

The page includes the CashOfferChat widget:

```html
<script src="/widget.js" data-site-id="demo"></script>
```

If you created a different widget Site ID for this demo, update the page to use that Site ID instead.

Recommended Site ID:

```text
sell-my-house-today-anywhere
```

## Files included

```text
middleware.ts
src/app/sellmyhousetodayanywhere/page.tsx
README.md
```

## Required setup in Vercel

Add the domain to the same Vercel project:

```text
sellmyhousetodayanywhere.com
www.sellmyhousetodayanywhere.com
```

Then point the DNS to Vercel.

## Required setup in CashOfferChat admin

In `/admin/sites`, create or confirm a widget site for:

```text
Site ID: demo
Domain: sellmyhousetodayanywhere.com
Allowed Domains:
sellmyhousetodayanywhere.com
www.sellmyhousetodayanywhere.com
cashofferchat.com
```

Or update the page to use your preferred Site ID.

## SQL migration

No SQL migration is required.

## Vercel environment variables

No new Vercel environment variables are required.
