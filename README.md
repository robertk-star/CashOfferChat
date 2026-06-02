# CashOfferChat Phase 3B — Client Accounts + Scoped Dashboard

This phase moves CashOfferChat closer to a true multi-company SaaS by adding client login accounts and a business-scoped dashboard.

## What this adds

- Client login page: `/client/login`
- Client dashboard: `/client`
- Client lead detail page: `/client/leads/[id]`
- Client logout route: `/api/client/logout`
- Admin client-user management page: `/admin/clients`
- Admin route to create/deactivate client users
- Business-scoped lead visibility
- Business-scoped site visibility
- Password hashing for client users
- Signed HTTP-only client session cookie

## Important SQL migration

Run this after the prior migrations:

```text
sql/010_client_accounts.sql
```

## New environment variable

Add this in Vercel:

```text
CLIENT_SESSION_SECRET
```

Use a long random value. Do not reuse the admin password.

## Testing checklist

1. Run `sql/010_client_accounts.sql` in Supabase.
2. Add `CLIENT_SESSION_SECRET` in Vercel.
3. Redeploy.
4. Log in as admin.
5. Go to `/admin/clients`.
6. Create a client user tied to an existing business.
7. Log out or open a private browser window.
8. Go to `/client/login`.
9. Confirm the client can see only leads and sites for their business.

## Notes

This is not Stripe billing yet. It is the login/scoping foundation needed before paid subscriptions.
