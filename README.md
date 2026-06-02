# CashOfferChat Phase 3E — Business Onboarding Wizard

This phase adds a master-admin onboarding flow so a new customer can be created quickly.

## What this adds

- Admin onboarding page: `/admin/onboarding`
- Admin onboarding submit route: `/api/admin/onboarding`
- Creates in one flow:
  - business record
  - business settings
  - widget site
  - service areas
  - referral areas
  - buying criteria
  - optional client user login
- Shows final embed code after onboarding.

## SQL migration

No new SQL migration is required if prior migrations are installed through Phase 3B.

This phase uses existing tables:

```text
businesses
business_settings
widget_sites
service_areas
referral_areas
property_buying_criteria
business_users
```

## Environment variables

No new Vercel environment variables are required if these already exist:

```text
ADMIN_DASHBOARD_PASSWORD
ADMIN_SESSION_SECRET
CLIENT_SESSION_SECRET
APP_URL
```

## Testing checklist

1. Log in at `/admin/login`.
2. Go to `/admin/onboarding`.
3. Create a test business with a unique site ID, such as `test-plano`.
4. Optionally create a client user with a temporary password.
5. Copy the embed code shown after saving.
6. Log in as the client at `/client/login`.
7. Confirm the client sees only its business data.
