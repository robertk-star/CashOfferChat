# CashOfferChat Client Auth Repair

This fixes the Vercel build error:

```text
Module '"@/lib/clientAuth"' has no exported member 'verifyClientSessionToken'
```

## What changed

Restores the full client auth helper:

```text
src/lib/clientAuth.ts
```

Exports:

- `clientCookieName`
- `hashClientPassword`
- `verifyClientPassword`
- `createClientSessionToken`
- `verifyClientSessionToken`

## SQL

No new SQL migration is required.

## Environment variables

No new Vercel environment variables are required if `CLIENT_SESSION_SECRET` already exists.
