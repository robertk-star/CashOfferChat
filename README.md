# CashOfferChat Phase 3N — QA Hardening + Route/File Audit

This phase improves platform stability and route visibility before moving into later polish/billing phases.

## What this adds/updates

### Updated system health checker

```text
src/lib/systemHealth.ts
```

Now checks the current full platform route/file set, including:

- admin dashboard
- businesses
- onboarding
- widget sites
- clients
- settings
- analytics
- system
- client login
- client dashboard
- client leads
- client sites
- client analytics
- client integrations
- client settings
- client account
- export APIs
- webhook/integration APIs
- widget APIs

### Updated admin system page

```text
src/app/admin/system/page.tsx
```

Now includes:

- Overall status
- Environment variable checks
- Supabase table checks
- Route file checks
- API route checks
- QA checklist
- Recommended manual test flow

### Updated system health API

```text
src/app/api/admin/system/health/route.ts
```

Returns structured JSON for all checks.

### Added QA checklist document

```text
docs/QA_CHECKLIST.md
```

A manual end-to-end checklist for future deploy testing.

## SQL migration

No SQL migration is required.

## Vercel environment variables

No new Vercel environment variables are required.

## After deploying

Go to:

```text
/admin/system
```

Review any red items first. Yellow warnings are usually optional services like OpenAI or Resend not being configured.
