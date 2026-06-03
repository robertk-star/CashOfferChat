# CashOfferChat Public Navigation Cleanup

This update changes the public CashOfferChat website navigation.

## What changed

On the public header:

- Removed the top navigation **Admin** link
- Changed the public login navigation to a simple **Login** link
- **Login** points to the customer dashboard login:

```text
/client/login
```

In the footer:

- Added/moved **Admin** link to:

```text
/admin/login
```

## Files changed

```text
src/components/PublicSiteHeader.tsx
src/components/PublicSiteFooter.tsx
README.md
```

## SQL migration

No SQL migration is required.

## Vercel environment variables

No new Vercel environment variables are required.
