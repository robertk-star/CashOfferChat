# CashOfferChat Phase 3C — Client Account Management

This phase improves the client account system added in Phase 3B.

## What this adds

- Client account page: `/client/account`
- Client password change route: `/api/client/account/password`
- Admin client user edit page: `/admin/clients/[id]`
- Admin client update/reset route: `/api/admin/clients/[id]`
- Ability for admin to:
  - update client name
  - update client email
  - move client to a different business
  - activate/deactivate a client user
  - reset client password
- Client dashboard link to Account page
- Admin clients list now links each client to its edit page

## SQL migration

No new Supabase SQL migration is required if Phase 3B has already been run.

This phase uses the existing `business_users` table from:

```text
sql/010_client_accounts.sql
```

## Environment variables

No new Vercel environment variables are required if `CLIENT_SESSION_SECRET` is already set.

## Testing checklist

1. Deploy this package.
2. Log in as admin.
3. Go to `/admin/clients`.
4. Open a client user.
5. Change name/status/password and save.
6. Log in as client.
7. Go to `/client/account`.
8. Change client password.
9. Log out and confirm the new password works.
