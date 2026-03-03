# BizOS Security

## Implemented Measures

### 1. Payment verification (all generation endpoints)
- `generate-plan`, `generate-business-plan`, and `generate-document` require a valid `paymentReference` in `businessData`
- Each request verifies the payment with Paystack before generating
- Requests without a verified payment receive `403 Forbidden`

### 2. CORS restriction
- Edge Functions no longer use `Access-Control-Allow-Origin: *`
- Allowed origins: `bizos.adparlay.com`, `www.bizos.adparlay.com`, and localhost variants
- Custom origins can be added via `ALLOWED_ORIGINS` (comma-separated) in Supabase secrets

### 3. Secrets
- API keys (`ANTHROPIC_API_KEY`, `PAYSTACK_SECRET_KEY`, `RESEND_API_KEY`) are stored only as Supabase secrets, never in frontend code
- Paystack webhook verifies signature with HMAC-SHA512

## Optional: Replay prevention

To prevent the same payment reference from being used multiple times, run this SQL in Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS payment_claims (
  reference TEXT PRIMARY KEY,
  claimed_at TIMESTAMPTZ DEFAULT NOW()
);
```

Then add replay-check logic to the generation functions (requires `SUPABASE_SERVICE_ROLE_KEY` secret).

## Optional: Rate limiting

Supabase Edge Functions do not include built-in rate limiting. Consider:

- **Cloudflare** in front of your domain (rate limiting rules)
- **Supabase table** tracking requests per IP with a time window
- **Upstash Redis** for distributed rate limiting
