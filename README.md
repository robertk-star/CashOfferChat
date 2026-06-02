# CashOfferChat Phase 3M — Webhook / CRM Integration Foundation

This phase adds a webhook integration foundation for delivering new seller leads to external systems such as Zapier, Make, GoHighLevel, HubSpot, Google Sheets, or a custom CRM.

## What this adds

### Client integrations page

```text
/client/integrations
```

Clients can manage:

- Webhook enabled / disabled
- Webhook URL
- Optional webhook secret
- Test webhook button

### Client integration save route

```text
/api/client/integrations
```

### Client test webhook route

```text
/api/client/integrations/test
```

### Lead webhook delivery helper

```text
src/lib/leadWebhook.ts
```

### Updated lead submit route

```text
src/app/api/leads/route.ts
```

When a lead is saved, the route attempts webhook delivery if the business has webhook delivery enabled.

Webhook failure does **not** block lead creation.

## SQL migration required

Run this in Supabase SQL Editor:

```text
sql/016_webhook_integrations.sql
```

This adds:

```text
business_settings.webhook_enabled
business_settings.webhook_url
business_settings.webhook_secret
seller_leads.webhook_sent_at
seller_leads.webhook_error
```

## Vercel environment variables

No new Vercel environment variables are required.

## Webhook payload

The payload includes:

```json
{
  "event": "seller_lead.created",
  "sentAt": "...",
  "businessId": "...",
  "siteId": "...",
  "lead": {
    "id": "...",
    "createdAt": "...",
    "status": "new",
    "name": "...",
    "phone": "...",
    "email": "...",
    "propertyAddress": "...",
    "propertyCity": "...",
    "situation": "...",
    "timeline": "...",
    "propertyCondition": "...",
    "notes": "...",
    "sourceUrl": "..."
  }
}
```

If a webhook secret is set, the request includes:

```text
X-CashOfferChat-Signature
```

This is an HMAC-SHA256 signature of the JSON payload.

## Testing

1. Run SQL migration.
2. Deploy package.
3. Log in as a client.
4. Go to `/client/integrations`.
5. Add a webhook URL from Zapier/Make/webhook.site.
6. Click **Send Test Webhook**.
7. Submit a test lead from the widget.
8. Confirm the webhook receives the lead.
